import { Logger } from "../Misc/logger";
import type { Scene } from "../scene";
import { Vector3, Vector2 } from "../Maths/math.vector";
import { VertexBuffer } from "../Buffers/buffer";
import { Mesh } from "../Meshes/mesh";
import { VertexData } from "../Meshes/mesh.vertexData";
import type { Nullable } from "../types";
import { Path2 } from "../Maths/math.path";
import { Epsilon } from "../Maths/math.constants";
import { EngineStore } from "../Engines/engineStore";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let earcut: any;
/**
 * Vector2 wth index property
 */
class IndexedVector2 extends Vector2 {
    constructor(
        original: Vector2,
        /** Index of the vector2 */
        public index: number
    ) {
        super(original.x, original.y);
    }
}

/**
 * Defines points to create a polygon
 */
class PolygonPoints {
    elements = [] as IndexedVector2[];

    add(originalPoints: Array<Vector2>): Array<IndexedVector2> {
        const result: IndexedVector2[] = [];
        for (const point of originalPoints) {
            const newPoint = new IndexedVector2(point, this.elements.length);
            result.push(newPoint);
            this.elements.push(newPoint);
        }

        return result;
    }

    computeBounds(): { min: Vector2; max: Vector2; width: number; height: number } {
        const lmin = new Vector2(this.elements[0].x, this.elements[0].y);
        const lmax = new Vector2(this.elements[0].x, this.elements[0].y);

        for (const point of this.elements) {
            // x
            if (point.x < lmin.x) {
                lmin.x = point.x;
            } else if (point.x > lmax.x) {
                lmax.x = point.x;
            }

            // y
            if (point.y < lmin.y) {
                lmin.y = point.y;
            } else if (point.y > lmax.y) {
                lmax.y = point.y;
            }
        }

        return {
            min: lmin,
            max: lmax,
            width: lmax.x - lmin.x,
            height: lmax.y - lmin.y,
        };
    }
}

/**
 * Polygon
 * @see https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/param#non-regular-polygon
 */
export class Polygon {
    /**
     * Creates a rectangle
     * @param xmin bottom X coord
     * @param ymin bottom Y coord
     * @param xmax top X coord
     * @param ymax top Y coord
     * @returns points that make the resulting rectangle
     */
    static Rectangle(xmin: number, ymin: number, xmax: number, ymax: number): Vector2[] {
        return [new Vector2(xmin, ymin), new Vector2(xmax, ymin), new Vector2(xmax, ymax), new Vector2(xmin, ymax)];
    }

    /**
     * Creates a circle
     * @param radius radius of circle
     * @param cx scale in x
     * @param cy scale in y
     * @param numberOfSides number of sides that make up the circle
     * @returns points that make the resulting circle
     */
    static Circle(radius: number, cx: number = 0, cy: number = 0, numberOfSides: number = 32): Vector2[] {
        const result: Vector2[] = [];

        let angle = 0;
        const increment = (Math.PI * 2) / numberOfSides;

        for (let i = 0; i < numberOfSides; i++) {
            result.push(new Vector2(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius));
            angle -= increment;
        }

        return result;
    }

    /**
     * Creates a polygon from input string
     * @param input Input polygon data
     * @returns the parsed points
     */
    static Parse(input: string): Vector2[] {
        const floats = input
            .split(/[^-+eE.\d]+/)
            .map(parseFloat)
            .filter((val) => !isNaN(val));
        let i: number;
        const result = [];
        for (i = 0; i < (floats.length & 0x7ffffffe); i += 2) {
            result.push(new Vector2(floats[i], floats[i + 1]));
        }
        return result;
    }

    /**
     * Starts building a polygon from x and y coordinates
     * @param x x coordinate
     * @param y y coordinate
     * @returns the started path2
     */
    static StartingAt(x: number, y: number): Path2 {
        return Path2.StartingAt(x, y);
    }
}

/**
 * Builds a polygon
 * @see https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/param/polyMeshBuilder
 */
export class PolygonMeshBuilder {
    private _points = new PolygonPoints();
    private _outlinepoints = new PolygonPoints();
    private _holes = new Array<PolygonPoints>();

    private _name: string;
    private _scene: Nullable<Scene>;

    private _epoints: number[] = new Array<number>();
    private _eholes: number[] = new Array<number>();

    private _addToepoint(points: Vector2[]) {
        for (const p of points) {
            this._epoints.push(p.x, p.y);
        }
    }

    /**
     * Babylon reference to the earcut plugin.
     */
    public bjsEarcut: any;

    /**
     * Creates a PolygonMeshBuilder
     * @param name name of the builder
     * @param contours Path of the polygon
     * @param scene scene to add to when creating the mesh
     * @param earcutInjection can be used to inject your own earcut reference
     */
    constructor(name: string, contours: Path2 | Vector2[] | any, scene?: Scene, earcutInjection = earcut) {
        this.bjsEarcut = earcutInjection;
        this._name = name;
        this._scene = scene || EngineStore.LastCreatedScene;

        let points: Vector2[];
        if (contours instanceof Path2) {
            points = contours.getPoints();
        } else {
            points = <Vector2[]>contours;
        }

        this._addToepoint(points);

        this._points.add(points);
        this._outlinepoints.add(points);

        if (typeof this.bjsEarcut === "undefined") {
            Logger.Warn("Earcut was not found, the polygon will not be built.");
        }
    }

    /**
     * Adds a hole within the polygon
     * @param hole Array of points defining the hole
     * @returns this
     */
    addHole(hole: Vector2[]): PolygonMeshBuilder {
        this._points.add(hole);
        const holepoints = new PolygonPoints();
        holepoints.add(hole);
        this._holes.push(holepoints);

        this._eholes.push(this._epoints.length / 2);
        this._addToepoint(hole);

        return this;
    }

    /**
     * Creates the polygon
     * @param updatable If the mesh should be updatable
     * @param depth The depth of the mesh created
     * @param smoothingThreshold Dot product threshold for smoothed normals
     * @returns the created mesh
     */
    build(updatable: boolean = false, depth: number = 0, smoothingThreshold: number = 2): Mesh {
        const result = new Mesh(this._name, this._scene);

        const vertexData = this.buildVertexData(depth, smoothingThreshold);

        result.setVerticesData(VertexBuffer.PositionKind, <number[]>vertexData.positions, updatable);
        result.setVerticesData(VertexBuffer.NormalKind, <number[]>vertexData.normals, updatable);
        result.setVerticesData(VertexBuffer.UVKind, <number[]>vertexData.uvs, updatable);
        result.setIndices(<number[]>vertexData.indices);

        return result;
    }

    /**
     * Creates the polygon
     * @param depth The depth of the mesh created
     * @param smoothingThreshold Dot product threshold for smoothed normals
     * @returns the created VertexData
     */
    buildVertexData(depth: number = 0, smoothingThreshold: number = 2): VertexData {
        const result = new VertexData();

        const normals: number[] = [];
        const positions: number[] = [];
        const uvs: number[] = [];

        const bounds = this._points.computeBounds();
        for (const p of this._points.elements) {
            normals.push(0, 1.0, 0);
            positions.push(p.x, 0, p.y);
            uvs.push((p.x - bounds.min.x) / bounds.width, (p.y - bounds.min.y) / bounds.height);
        }

        const indices: number[] = [];

        const res = this.bjsEarcut(this._epoints, this._eholes, 2);

        for (let i = 0; i < res.length; i++) {
            indices.push(res[i]);
        }

        if (depth > 0) {
            const positionscount = positions.length / 3; //get the current pointcount

            for (const p of this._points.elements) {
                //add the elements at the depth
                normals.push(0, -1.0, 0);
                positions.push(p.x, -depth, p.y);
                uvs.push(1 - (p.x - bounds.min.x) / bounds.width, 1 - (p.y - bounds.min.y) / bounds.height);
            }

            const totalCount = indices.length;
            for (let i = 0; i < totalCount; i += 3) {
                const i0 = indices[i + 0];
                const i1 = indices[i + 1];
                const i2 = indices[i + 2];

                indices.push(i2 + positionscount);
                indices.push(i1 + positionscount);
                indices.push(i0 + positionscount);
            }

            //Add the sides
            this._addSide(positions, normals, uvs, indices, bounds, this._outlinepoints, depth, false, smoothingThreshold);

            for (const hole of this._holes) {
                this._addSide(positions, normals, uvs, indices, bounds, hole, depth, true, smoothingThreshold);
            }
        }

        result.indices = indices;
        result.positions = positions;
        result.normals = normals;
        result.uvs = uvs;

        return result;
    }

    /**
     * Adds a side to the polygon
     * @param positions points that make the polygon
     * @param normals normals of the polygon
     * @param uvs uvs of the polygon
     * @param indices indices of the polygon
     * @param bounds bounds of the polygon
     * @param points points of the polygon
     * @param depth depth of the polygon
     * @param flip flip of the polygon
     * @param smoothingThreshold
     */
    private _addSide(positions: any[], normals: any[], uvs: any[], indices: any[], bounds: any, points: PolygonPoints, depth: number, flip: boolean, smoothingThreshold: number) {
        let startIndex: number = positions.length / 3;
        let ulength: number = 0;
        for (let i: number = 0; i < points.elements.length; i++) {
            const p: IndexedVector2 = points.elements[i];
            const p1: IndexedVector2 = points.elements[(i + 1) % points.elements.length];

            positions.push(p.x, 0, p.y);
            positions.push(p.x, -depth, p.y);
            positions.push(p1.x, 0, p1.y);
            positions.push(p1.x, -depth, p1.y);

            const p0: IndexedVector2 = points.elements[(i + points.elements.length - 1) % points.elements.length];
            const p2: IndexedVector2 = points.elements[(i + 2) % points.elements.length];

            let vc = new Vector3(-(p1.y - p.y), 0, p1.x - p.x);
            let vp = new Vector3(-(p.y - p0.y), 0, p.x - p0.x);
            let vn = new Vector3(-(p2.y - p1.y), 0, p2.x - p1.x);

            if (!flip) {
                vc = vc.scale(-1);
                vp = vp.scale(-1);
                vn = vn.scale(-1);
            }

            const vcNorm = vc.normalizeToNew();
            let vpNorm = vp.normalizeToNew();
            let vnNorm = vn.normalizeToNew();

            const dotp = Vector3.Dot(vpNorm, vcNorm);
            if (dotp > smoothingThreshold) {
                if (dotp < Epsilon - 1) {
                    vpNorm = new Vector3(p.x, 0, p.y).subtract(new Vector3(p1.x, 0, p1.y)).normalize();
                } else {
                    // cheap average weighed by side length
                    vpNorm = vp.add(vc).normalize();
                }
            } else {
                vpNorm = vcNorm;
            }

            const dotn = Vector3.Dot(vn, vc);
            if (dotn > smoothingThreshold) {
                if (dotn < Epsilon - 1) {
                    // back to back
                    vnNorm = new Vector3(p1.x, 0, p1.y).subtract(new Vector3(p.x, 0, p.y)).normalize();
                } else {
                    // cheap average weighed by side length
                    vnNorm = vn.add(vc).normalize();
                }
            } else {
                vnNorm = vcNorm;
            }

            uvs.push(ulength / bounds.width, 0);
            uvs.push(ulength / bounds.width, 1);
            ulength += vc.length();
            uvs.push(ulength / bounds.width, 0);
            uvs.push(ulength / bounds.width, 1);

            normals.push(vpNorm.x, vpNorm.y, vpNorm.z);
            normals.push(vpNorm.x, vpNorm.y, vpNorm.z);
            normals.push(vnNorm.x, vnNorm.y, vnNorm.z);
            normals.push(vnNorm.x, vnNorm.y, vnNorm.z);

            if (!flip) {
                indices.push(startIndex);
                indices.push(startIndex + 1);
                indices.push(startIndex + 2);

                indices.push(startIndex + 1);
                indices.push(startIndex + 3);
                indices.push(startIndex + 2);
            } else {
                indices.push(startIndex);
                indices.push(startIndex + 2);
                indices.push(startIndex + 1);

                indices.push(startIndex + 1);
                indices.push(startIndex + 2);
                indices.push(startIndex + 3);
            }
            startIndex += 4;
        }
    }
}
