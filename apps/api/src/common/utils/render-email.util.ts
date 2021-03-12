import * as ejs from "ejs";
import * as path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mjml2html = require("mjml");

const mjmlDirectory = path.join(__dirname, "./assets/emails");

export const renderEmail = async (mjmlTemplate: string, data?: ejs.Data) => {
  const mjmlPath = path.join(mjmlDirectory, `${mjmlTemplate}.mjml`);

  const mjml = await ejs.renderFile(mjmlPath, data);

  const { errors, html } = mjml2html(mjml, {
    actualPath: mjmlDirectory
  });

  if (errors.length > 0) {
    throw new Error(errors.map((error: Error) => error.message).join("\n"));
  }

  return html;
};
