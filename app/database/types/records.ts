import { RecordDetail } from "./address";

export interface AddressRecords {
  address: string;
  begin: number;
  end: number;
  measure: {
    requestTime: number;
    totalTime: number;
  };
  recordsMap: {
    [program in string]?: { [commitment in string]?: RecordDetail };
  };
}
