import { PortName } from "../../common/types/port";
import { KeepAliveClient } from "../../common/utils/client";
import { logger } from "../../common/utils/logger";

const keepAliveClient = new KeepAliveClient(PortName.CONTENT_TO_BACKGROUND);

logger.log("===> Content script init success");
