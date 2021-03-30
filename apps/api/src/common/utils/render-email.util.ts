import * as fs from "fs";
import * as path from "path";

import { compile } from "handlebars";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mjml2html = require("mjml");

const mjmlDirectory = path.join(__dirname, "./assets/emails");

export const renderEmail = async (
  filename: string,
  context: Record<string, unknown> = {}
) => {
  const location = path.join(mjmlDirectory, `${filename}.handlebars`);

  const mjml = await fs.promises.readFile(location, {
    encoding: "utf-8"
  });

  const template = compile(mjml);

  const rendered = template(context);

  const { errors, html } = mjml2html(rendered, {
    actualPath: mjmlDirectory
  });

  if (errors.length > 0) {
    throw new Error(errors);
  }

  return html;
};
