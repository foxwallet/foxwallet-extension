export enum TransactionStatus {
  DROPPED = "DROPPED", // 丢弃，一般是被其他交易替换，很少用到
  PENDING = "PENDING", // 未被打包进区块
  SUCCESS = "SUCCESS", // 已被打包进区块，且执行成功
  FAILED = "FAILED", // 已被打包进区块，但执行失败
}
