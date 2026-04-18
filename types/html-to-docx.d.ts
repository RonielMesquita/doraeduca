declare module "html-to-docx" {
  export default function HTMLtoDOCX(
    html: string,
    headerHtml?: string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
    footerHtml?: string | null
  ): Promise<Buffer>;
}
