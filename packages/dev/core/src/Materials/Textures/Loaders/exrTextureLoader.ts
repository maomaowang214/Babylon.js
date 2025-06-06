import type { Nullable } from "core/types";
import type { InternalTexture } from "../internalTexture";
import type { IInternalTextureLoader } from "./internalTextureLoader";
import { GetExrHeader } from "./EXR/exrLoader.header";
import { CreateDecoderAsync, ScanData } from "./EXR/exrLoader.decoder";
import { ExrLoaderGlobalConfiguration, EXROutputType } from "./EXR/exrLoader.configuration";
import { Logger } from "core/Misc/logger";

/**
 * Inspired by https://github.com/sciecode/three.js/blob/dev/examples/jsm/loaders/EXRLoader.js
 * Referred to the original Industrial Light & Magic OpenEXR implementation and the TinyEXR / Syoyo Fujita
 * implementation.
 */

// /*
// Copyright (c) 2014 - 2017, Syoyo Fujita
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Syoyo Fujita nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// */

// // TinyEXR contains some OpenEXR code, which is licensed under ------------

// ///////////////////////////////////////////////////////////////////////////
// //
// // Copyright (c) 2002, Industrial Light & Magic, a division of Lucas
// // Digital Ltd. LLC
// //
// // All rights reserved.
// //
// // Redistribution and use in source and binary forms, with or without
// // modification, are permitted provided that the following conditions are
// // met:
// // *       Redistributions of source code must retain the above copyright
// // notice, this list of conditions and the following disclaimer.
// // *       Redistributions in binary form must reproduce the above
// // copyright notice, this list of conditions and the following disclaimer
// // in the documentation and/or other materials provided with the
// // distribution.
// // *       Neither the name of Industrial Light & Magic nor the names of
// // its contributors may be used to endorse or promote products derived
// // from this software without specific prior written permission.
// //
// // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// // "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// // LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// // OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// // LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// // OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// //
// ///////////////////////////////////////////////////////////////////////////

// // End of OpenEXR license -------------------------------------------------

/**
 * Loader for .exr file format
 * @see [PIZ compression](https://playground.babylonjs.com/#4RN0VF#151)
 * @see [ZIP compression](https://playground.babylonjs.com/#4RN0VF#146)
 * @see [RLE compression](https://playground.babylonjs.com/#4RN0VF#149)
 * @see [PXR24 compression](https://playground.babylonjs.com/#4RN0VF#150)
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export class _ExrTextureLoader implements IInternalTextureLoader {
    /**
     * Defines whether the loader supports cascade loading the different faces.
     */
    public readonly supportCascades = false;

    /**
     * Uploads the cube texture data to the WebGL texture. It has already been bound.
     * @param _data contains the texture data
     * @param _texture defines the BabylonJS internal texture
     * @param _createPolynomials will be true if polynomials have been requested
     * @param _onLoad defines the callback to trigger once the texture is ready
     * @param _onError defines the callback to trigger in case of error
     * Cube texture are not supported by .exr files
     */
    public loadCubeData(
        _data: ArrayBufferView | ArrayBufferView[],
        _texture: InternalTexture,
        _createPolynomials: boolean,
        _onLoad: Nullable<(data?: any) => void>,
        _onError: Nullable<(message?: string, exception?: any) => void>
    ): void {
        // eslint-disable-next-line no-throw-literal
        throw ".exr not supported in Cube.";
    }

    /**
     * Uploads the 2D texture data to the WebGL texture. It has already been bound once in the callback.
     * @param data contains the texture data
     * @param texture defines the BabylonJS internal texture
     * @param callback defines the method to call once ready to upload
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public loadData(
        data: ArrayBufferView,
        texture: InternalTexture,
        callback: (width: number, height: number, loadMipmap: boolean, isCompressed: boolean, done: () => void, failedLoading?: boolean) => void
    ) {
        const dataView = new DataView(data.buffer);

        const offset = { value: 0 };
        const header = GetExrHeader(dataView, offset);
        CreateDecoderAsync(header, dataView, offset, ExrLoaderGlobalConfiguration.DefaultOutputType)
            // eslint-disable-next-line github/no-then
            .then((decoder) => {
                ScanData(decoder, header, dataView, offset);

                // Updating texture
                const width = header.dataWindow.xMax - header.dataWindow.xMin + 1;
                const height = header.dataWindow.yMax - header.dataWindow.yMin + 1;
                callback(width, height, texture.generateMipMaps, false, () => {
                    const engine = texture.getEngine();
                    texture.format = header.format;
                    texture.type = decoder.textureType;
                    texture.invertY = false;
                    texture._gammaSpace = !header.linearSpace;
                    if (decoder.byteArray) {
                        engine._uploadDataToTextureDirectly(texture, decoder.byteArray, 0, 0, undefined, true);
                    }
                });
            })
            // eslint-disable-next-line github/no-then
            .catch((error) => {
                Logger.Error("Failed to load EXR texture: ", error);
            });
    }
}

/**
 * Read the EXR data from an ArrayBufferView asynchronously.
 * @param data ArrayBufferView containing the EXR data
 * @returns An object containing the width, height, and data of the EXR texture.
 */
export async function ReadExrDataAsync(data: ArrayBuffer): Promise<{ width: number; height: number; data: Nullable<Float32Array> }> {
    const dataView = new DataView(data);

    const offset = { value: 0 };
    const header = GetExrHeader(dataView, offset);
    try {
        const decoder = await CreateDecoderAsync(header, dataView, offset, EXROutputType.Float);
        ScanData(decoder, header, dataView, offset);

        if (!decoder.byteArray) {
            Logger.Error("Failed to decode EXR data: No byte array available.");
            return { width: 0, height: 0, data: null };
        }

        return {
            width: header.dataWindow.xMax - header.dataWindow.xMin + 1,
            height: header.dataWindow.yMax - header.dataWindow.yMin + 1,
            data: new Float32Array(decoder.byteArray),
        };
    } catch (error) {
        Logger.Error("Failed to load EXR data: ", error);
    }

    return { width: 0, height: 0, data: null };
}
