import { createParamDecorator } from "@nestjs/common";

import { RequestContext } from "../contexts/request.context";

export const CurrentUser = createParamDecorator(() => RequestContext.getItem("user"));
