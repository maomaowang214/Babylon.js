import * as React from "react";

import type { Observable } from "core/Misc/observable";

import type { PropertyChangedEvent } from "../../../../propertyChangedEvent";
import type { LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import { LineContainerComponent } from "shared-ui-components/lines/lineContainerComponent";
import type { GlobalState } from "../../../../globalState";
import { SpriteManager } from "core/Sprites/spriteManager";
import { TextInputLineComponent } from "shared-ui-components/lines/textInputLineComponent";
import { TextLineComponent } from "shared-ui-components/lines/textLineComponent";
import { CheckBoxLineComponent } from "shared-ui-components/lines/checkBoxLineComponent";
import { FloatLineComponent } from "shared-ui-components/lines/floatLineComponent";
import { SliderLineComponent } from "shared-ui-components/lines/sliderLineComponent";
import { RenderingManager } from "core/Rendering/renderingManager";
import { TextureLinkLineComponent } from "../../../lines/textureLinkLineComponent";
import { ButtonLineComponent } from "shared-ui-components/lines/buttonLineComponent";
import { Sprite } from "core/Sprites/sprite";
import { Tools } from "core/Misc/tools";
import { FileButtonLineComponent } from "shared-ui-components/lines/fileButtonLineComponent";
import { Constants } from "core/Engines/constants";
import { OptionsLineComponent } from "shared-ui-components/lines/optionsLineComponent";

interface ISpriteManagerPropertyGridComponentProps {
    globalState: GlobalState;
    spriteManager: SpriteManager;
    lockObject: LockObject;
    onSelectionChangedObservable?: Observable<any>;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
}

export class SpriteManagerPropertyGridComponent extends React.Component<ISpriteManagerPropertyGridComponentProps> {
    private _snippetUrl = Constants.SnippetUrl;

    constructor(props: ISpriteManagerPropertyGridComponentProps) {
        super(props);
    }

    addNewSprite() {
        const spriteManager = this.props.spriteManager;
        const newSprite = new Sprite("new sprite", spriteManager);

        this.props.onSelectionChangedObservable?.notifyObservers(newSprite);
    }

    disposeManager() {
        const spriteManager = this.props.spriteManager;
        spriteManager.dispose();

        this.props.onSelectionChangedObservable?.notifyObservers(null);
    }

    saveToFile() {
        const spriteManager = this.props.spriteManager;
        const content = JSON.stringify(spriteManager.serialize(true));

        Tools.Download(new Blob([content]), "spriteManager.json");
    }

    loadFromFile(file: File) {
        const spriteManager = this.props.spriteManager;
        const scene = spriteManager.scene;

        Tools.ReadFile(
            file,
            (data) => {
                const decoder = new TextDecoder("utf-8");
                const jsonObject = JSON.parse(decoder.decode(data));

                spriteManager.dispose();
                this.props.globalState.onSelectionChangedObservable.notifyObservers(null);

                const newManager = SpriteManager.Parse(jsonObject, scene, "");
                this.props.globalState.onSelectionChangedObservable.notifyObservers(newManager);
            },
            undefined,
            true
        );
    }

    loadFromSnippet() {
        const spriteManager = this.props.spriteManager;
        const scene = spriteManager.scene;

        const snippedId = window.prompt("请输入要使用的代码片段ID");

        if (!snippedId) {
            return;
        }

        spriteManager.dispose();
        this.props.globalState.onSelectionChangedObservable.notifyObservers(null);

        SpriteManager.ParseFromSnippetAsync(snippedId, scene)
            .then((newManager) => {
                this.props.globalState.onSelectionChangedObservable.notifyObservers(newManager);
            })
            .catch((err) => {
                alert("无法加载精灵管理器: " + err);
            });
    }

    saveToSnippet() {
        const spriteManager = this.props.spriteManager;
        const content = JSON.stringify(spriteManager.serialize(true));

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    const snippet = JSON.parse(xmlHttp.responseText);
                    const oldId = spriteManager.snippetId || "_BLANK";
                    spriteManager.snippetId = snippet.id;
                    if (snippet.version && snippet.version != "0") {
                        spriteManager.snippetId += "#" + snippet.version;
                    }
                    this.forceUpdate();
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(spriteManager.snippetId);
                    }

                    const windowAsAny = window as any;

                    if (windowAsAny.Playground && oldId) {
                        windowAsAny.Playground.onRequestCodeChangeObservable.notifyObservers({
                            regex: new RegExp(`SpriteManager.ParseFromSnippetAsync\\("${oldId}`, "g"),
                            replace: `SpriteManager.ParseFromSnippetAsync("${spriteManager.snippetId}`,
                        });
                    }

                    alert("精灵管理器保存ID: " + spriteManager.snippetId + " (请注意，id也保存到剪贴板中)");
                } else {
                    alert("Unable to save your sprite manager");
                }
            }
        };

        xmlHttp.open("POST", this._snippetUrl + (spriteManager.snippetId ? "/" + spriteManager.snippetId : ""), true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");

        const dataToSend = {
            payload: JSON.stringify({
                spriteManager: content,
            }),
            name: "",
            description: "",
            tags: "",
        };

        xmlHttp.send(JSON.stringify(dataToSend));
    }

    render() {
        const spriteManager = this.props.spriteManager;

        const alphaModeOptions = [
            { label: "组合", value: Constants.ALPHA_COMBINE },
            { label: "一对一", value: Constants.ALPHA_ONEONE },
            { label: "加", value: Constants.ALPHA_ADD },
            { label: "减", value: Constants.ALPHA_SUBTRACT },
            { label: "乘", value: Constants.ALPHA_MULTIPLY },
            { label: "最大化", value: Constants.ALPHA_MAXIMIZED },
            { label: "预乘", value: Constants.ALPHA_PREMULTIPLIED },
        ];

        return (
            <>
                <LineContainerComponent title="常规" selection={this.props.globalState}>
                    <TextInputLineComponent
                        lockObject={this.props.lockObject}
                        label="名称"
                        target={spriteManager}
                        propertyName="name"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <TextLineComponent label="唯一ID" value={spriteManager.uniqueId.toString()} />
                    <TextLineComponent label="容积" value={spriteManager.capacity.toString()} />
                    <TextureLinkLineComponent label="纹理" texture={spriteManager.texture} onSelectionChangedObservable={this.props.onSelectionChangedObservable} />
                    {spriteManager.sprites.length < spriteManager.capacity && <ButtonLineComponent label="添加新精灵" onClick={() => this.addNewSprite()} />}
                    <ButtonLineComponent label="删除" onClick={() => this.disposeManager()} />
                </LineContainerComponent>
                <LineContainerComponent title="文件" selection={this.props.globalState}>
                    <FileButtonLineComponent label="加载" onClick={(file) => this.loadFromFile(file)} accept=".json" />
                    <ButtonLineComponent label="保存" onClick={() => this.saveToFile()} />
                </LineContainerComponent>
                <LineContainerComponent title="片段" selection={this.props.globalState}>
                    {spriteManager.snippetId && <TextLineComponent label="片段 ID" value={spriteManager.snippetId} />}
                    <ButtonLineComponent label="从服务器加载片段" onClick={() => this.loadFromSnippet()} />
                    <ButtonLineComponent label="保存片段到服务器" onClick={() => this.saveToSnippet()} />
                </LineContainerComponent>
                <LineContainerComponent title="属性" selection={this.props.globalState}>
                    <CheckBoxLineComponent label="可选中" target={spriteManager} propertyName="isPickable" onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    <CheckBoxLineComponent
                        label="雾启用"
                        target={spriteManager}
                        propertyName="fogEnabled"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <CheckBoxLineComponent
                        label="无深度写入"
                        target={spriteManager}
                        propertyName="disableDepthWrite"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <SliderLineComponent
                        lockObject={this.props.lockObject}
                        label="渲染组ID"
                        decimalCount={0}
                        target={spriteManager}
                        propertyName="renderingGroupId"
                        minimum={RenderingManager.MIN_RENDERINGGROUPS}
                        maximum={RenderingManager.MAX_RENDERINGGROUPS - 1}
                        step={1}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <OptionsLineComponent
                        label="阿尔法模式"
                        options={alphaModeOptions}
                        target={spriteManager}
                        propertyName="blendMode"
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                        onSelect={(value) => this.setState({ blendMode: value })}
                    />
                </LineContainerComponent>
                <LineContainerComponent title="单元格" selection={this.props.globalState}>
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="单元格宽度"
                        isInteger={true}
                        target={spriteManager}
                        propertyName="cellWidth"
                        min={0}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                    <FloatLineComponent
                        lockObject={this.props.lockObject}
                        label="单元格高度"
                        isInteger={true}
                        target={spriteManager}
                        propertyName="cellHeight"
                        min={0}
                        onPropertyChangedObservable={this.props.onPropertyChangedObservable}
                    />
                </LineContainerComponent>
            </>
        );
    }
}
