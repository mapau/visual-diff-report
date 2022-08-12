import { html, css, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { VisualDiffImage, VisualDiffReportDB } from "../shared";
import { basename } from "path";
import info from "./info.svg?raw";

import "./visual-diff";
import { item } from "./styles";

@customElement("visual-diff-app")
export class VisualDiffApp extends LitElement {
  static styles = [
    item,
    css`
      :host {
        height: 100%;
        width: 100%;
        display: flex;
        overflow: hidden;
      }
      h1 {
        text-align: left;
        margin-bottom: 0px;
      }
      h4 {
        margin: 0px;
        margin-bottom: 30px;
        font-size: 14px;
        font-weight: 100;
      }
      .menu {
        margin: 20px;
        width: 20%;
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .help {
        position: fixed;
        right: 10px;
        top: 0px;
        font-size: 30px;
        opacity: 0.6;
        cursor: pointer;
      }
      .help:hover {
        color: rgba(0, 0, 0, 9);
      }

      .help-overlay {
        width: 0%;
        height: 0%;
        left: 50%;
        top: 50%;
        display: flex;
        position: fixed;
        z-index: 1;
        transition: all 0.15s;
        background: rgba(43, 207, 255, 0.8);
        overflow: hidden;
      }
      .help-overlay.visible {
        width: 100%;
        left: 0%;
        top: 0%;
        height: 100%;
      }
      .help-overlay > div {
        margin: auto;
        background: rgba(255, 255, 255, 1);
        box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.3);
        padding: 20px;
      }
      .list {
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
      }
      .frame {
        width: 100%;
        overflow: hidden;
        display: flex;
      }
      .content {
        width: 100%;
        display: flex;
        border-left: 1px solid rgba(0, 0, 0, 0.1);
      }
      .content > div {
        margin: auto;
        overflow: hidden;
        height: 90%;
        width: 90%;
      }
      visual-diff {
        width: 100%;
        height: 100%;
        border: 1px slid rgba(0, 0, 0, 0.05);
      }
      .indicator {
        display: block;
        border-radius: 20px;
        height: 10px;
        margin-right: 8px;
        margin-left: 8px;
        width: 10px;
      }
      .failed {
        background: rgba(255, 0, 0, 0.2);
      }
      .passed .indicator {
        background: green;
      }
      .failed .indicator {
        background: red;
      }
      .item {
        padding-right: 10px;
      }
      .hr {
        margin-top: 16px;
        margin-bottom: 16px;
        border-bottom: 0px;
        border: none;
        height: 1px;
        margin-left: -20px;
        margin-right: -20px;
        background-color: rgba(0, 0, 0, 0.1);
      }
      input,
      select {
        background: rgba(0, 0, 0, 0.05);
        color: #5a6674;
        font-size: 16px;
        border: none;
        appearance: none;
        outline: none;
        padding: 4px;
        border-radius: 20px;
        width: 100%;
        margin: 4px;
      }
      select {
        appearance: auto;
        width: initial;
      }
    `,
  ];

  @state() db: VisualDiffReportDB | undefined;
  @state() selected = 0;
  @state() tab = 0;
  @state() help = false;
  @state() search = "";
  @state() filterOption: "all" | "passed" | "failed" = "all";

  filterOptions = {
    all: (_image: VisualDiffImage) => true,
    passed: (_image: VisualDiffImage) => !_image.diff,
    failed: (_image: VisualDiffImage) => !!_image.diff,
  };

  _keyDown = this.keyDown.bind(this);
  _observer: MutationObserver | undefined;

  connectedCallback(): void {
    super.connectedCallback();

    try {
      this.db = JSON.parse(this.innerHTML);
    } catch (e) {
      this.db = undefined;
    }
    this._observer = new MutationObserver(() => {
      this.db = JSON.parse(this.innerHTML);
    });
    this._observer.observe(this.renderRoot, { childList: true });
    document.body.addEventListener("keydown", this._keyDown);
  }

  getName(image: VisualDiffImage) {
    return basename(image.current || "");
  }

  get filter() {
    return this.filterOptions[this.filterOption];
  }

  get filtered() {
    if (!this.db) {
      return [];
    }
    return this.search || this.filter
      ? Object.values(this.db.images).filter((image) => {
          const name = this.getName(image);
          return (
            this.filter(image) &&
            this.search
              .split(" ")
              .reduce(
                (acc: boolean, filter) =>
                  acc || !!name.match(new RegExp(filter, "i")),
                false
              )
          );
        })
      : Object.values(this.db?.images);
  }
  disconnectedCallback(): void {
    document.body.removeEventListener("keydown", this._keyDown);
    this._observer?.disconnect();
  }

  renderMenu() {
    const filtered = this.filtered;
    return this.db
      ? html` <div class="help" @click=${() => (this.help = true)}>
            ${unsafeHTML(info)}
          </div>
          <h1>Visual Diff</h1>
          <h4>${this.db.title}</h4>
          <input
            type="search"
            value=${this.search}
            @input=${({ target }: { target: HTMLInputElement }) => {
              this.search = target.value;
            }}
            placeholder="Search"
            class="search-input"
          />
          <div>
            <select
              @change=${({ target }: Event) =>
                (this.filterOption = (target as any).value)}
              value=${this.filterOption}
            >
              ${Object.keys(this.filterOptions).map(
                (option) =>
                  html`<option value=${option}>Show ${option}</option>`
              )}
            </select>
          </div>
          <div class="hr"></div>
          <div class="list">
            ${filtered.length === 0 ? html`<i>- no images -</i>` : ""}
            ${filtered.map((image, index) => {
              return html`<div
                @click=${() => (this.selected = index)}
                class=${classMap({
                  item: true,
                  passed: !image.diff,
                  failed: !!image.diff,
                  selected: index === this.selected,
                })}
              >
                <div class="indicator"></div>
                ${this.getName(image)}
              </div>`;
            })}
          </div>`
      : undefined;
  }

  render() {
    return this.db
      ? html` <div class="frame">
            <div class="menu">${this.renderMenu()}</div>
            <div class="content">
              <div>
                <visual-diff
                  @tab-changed=${({ detail }: { detail: number }) =>
                    (this.tab = detail)}
                  .image=${this.filtered[this.selected]}
                  .tab=${this.tab}
                ></visual-diff>
              </div>
            </div>
          </div>
          <div
            class=${classMap({
              "help-overlay": true,
              visible: this.help,
            })}
            @click=${() => (this.help = false)}
          >
            <div>
              <h1>Navigation</h1>
              <p>
                Use arrow keys <b>up</b> and <b>down</b> to cycle through
                images;
              </p>
              <p>
                Use arrow keys <b>left</b> and <b>right</b> or
                <b>number keys</b> to cycle through diff visualizations;
              </p>
            </div>
          </div>`
      : "loading";
  }

  keyDown(e: KeyboardEvent) {
    if (!this.db) {
      return;
    }
    if (e.key === "ArrowUp") {
      this.selected =
        (this.selected - 1 + Object.values(this.filtered).length) %
        Object.values(this.filtered).length;
    }
    if (e.key === "ArrowDown") {
      this.selected = (this.selected + 1) % Object.values(this.filtered).length;
    }
    const ntabs = 4;
    if (e.key === "ArrowLeft") {
      this.tab = (this.tab + -1 + ntabs) % ntabs;
    }
    if (e.key === "ArrowRight") {
      this.tab = (this.tab + 1) % ntabs;
    }

    if (parseInt(e.key) + "" === e.key) {
      this.tab = (parseInt(e.key) - 1) % ntabs;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "visual-diff-app": VisualDiffApp;
  }
}
