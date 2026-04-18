declare module "html-to-docx" {
  interface Options {
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    title?: string;
    orientation?: "portrait" | "landscape";
    font?: string;
    fontSize?: number;
  }

  export default function HTMLtoDOCX(
    html: string,
    headerHtml?: string | null,
    options?: Options,
    footerHtml?: string | null
  ): Promise<Buffer>;
}
