export interface FutureJSON {
  program_id: string;
  function_name: string;
  arguments: string[];
}

export type LogFunc = (type: "log" | "error", ...args: any[]) => void;

export type AleoProgramImportsMap = {
  [key in string]: string;
};
