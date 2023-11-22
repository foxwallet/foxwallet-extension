// import { SerializeType } from "@/scripts/background/servers/IWalletServer";
// import useSWR, { SWRHook } from "swr";

// function formatData(data: any): string | any {
//   if (typeof data === "object" && data !== null) {
//     if (data.type && data.value) {
//       switch (data.type) {
//         case SerializeType.BIG_INT: {
//           return BigInt(data.value);
//         }
//       }
//     }
//     for (let key in data) {
//       data[key] = formatData(data[key]);
//     }
//   }
//   return data;
// }

// export function convertMiddleware(useSWRNext: SWRHook) {
//   return function <T>(...params: Parameters<SWRHook>) {
//     const swr = useSWRNext(...params);

//     const data: T = formatData(swr.data);

//     return { ...swr, data };
//   };
// }

// export const useSWRWithConvert = convertMiddleware(useSWR);
