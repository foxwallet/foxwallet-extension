import { init, RematchDispatch, RematchRootState } from "@rematch/core";
import { models, RootModel } from "./index";
import persistPlugin from "@rematch/persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import loadingPlugin, { ExtraModelsFromLoading } from "@rematch/loading";
import { PersistConfig } from "redux-persist/lib/types";
import createMigrate from "redux-persist/lib/createMigrate";
import selectPlugin from "@rematch/select";
import { storageInstance } from "../common/utils/storage";

type FullModel = ExtraModelsFromLoading<RootModel>;

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage: storageInstance,
  stateReconciler: autoMergeLevel2,
  version: 1,
  // debug: __DEV__,
  // @ts-ignore
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
