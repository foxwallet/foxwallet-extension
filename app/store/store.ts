import {
  init,
  type RematchDispatch,
  type RematchRootState,
} from "@rematch/core";
import { models, type RootModel } from "./index";
import persistPlugin from "@rematch/persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import loadingPlugin, { type ExtraModelsFromLoading } from "@rematch/loading";
import { type PersistConfig } from "redux-persist/lib/types";
import createMigrate from "redux-persist/lib/createMigrate";
import selectPlugin from "@rematch/select";
import { appStorageInstance } from "../common/utils/storage";
// import { isDev } from "../common/utils/env";
import { logger } from "../common/utils/logger";

type FullModel = ExtraModelsFromLoading<RootModel>;

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage: appStorageInstance,
  stateReconciler: autoMergeLevel2,
  version: 1,
  debug: false,
  // IndexedDB can store object directly
  serialize: false,
  // @ts-expect-error deserialize and serialize both be false
  deserialize: false,
  writeFailHandler: (err) => {
    logger.error("redux persist write fail", err.message);
  },
  // migrate: createMigrate(migrations, { debug: __DEV__ }),
};

export const store = init<RootModel, FullModel>({
  plugins: [
    persistPlugin(persistConfig),
    loadingPlugin({
      whitelist: [],
    }),
    selectPlugin(),
  ],
  models,
  redux: {},
});

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel, FullModel>;
