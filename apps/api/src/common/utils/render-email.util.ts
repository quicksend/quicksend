import fs from "fs";
import path from "path";

import handlebars from "handlebars";
import mjml2html from "mjml";

export const MJML_DIRECTORY = path.join(__dirname, "./assets/emails");

export const renderEmail = async (
  filename: string,
  context: Record<string, unknown> = {}
) => {
  const location = path.join(MJML_DIRECTORY, `${filename}.handlebars`);

  const mjml = await fs.promises.readFile(location, {
    encoding: "utf-8"
  });

  const template = handlebars.compile(mjml);

  const rendered = template(context);

  const { errors, html } = mjml2html(rendered, {
    actualPath: MJML_DIRECTORY
  });

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return html;
};
