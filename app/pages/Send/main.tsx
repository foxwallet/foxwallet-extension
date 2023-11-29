import { H6 } from "@/common/theme/components/text";
import { ERROR_CODE } from "@/common/types/error";
import { BaseInputGroup } from "@/components/Custom/Input";
import { showSelectFeeTypeDialog } from "@/components/Send/SelectFeeType";
import { showSelectTransferMethodDialog } from "@/components/Send/SelectTransferMethod";
import { showAleoTransferInfoDialog } from "@/components/Send/TransferInfo";
import { useBalance } from "@/hooks/useBalance";
import { useClient } from "@/hooks/useClient";
import { useCoinBasic, useCoinService } from "@/hooks/useCoinService";
import { useCurrAccount } from "@/hooks/useCurrAccount";
import { useRecords } from "@/hooks/useRecord";
import { PageWithHeader } from "@/layouts/Page";
import { Button, Flex, InputRightElement, Text } from "@chakra-ui/react";
import { AleoFeeMethod } from "core/coins/ALEO/types/FeeMethod";
import { RecordDetailWithSpent } from "core/coins/ALEO/types/SyncTask";
import {
  AleoLocalTxInfo,
  AleoTxStatus,
} from "core/coins/ALEO/types/Tranaction";
import { AleoTransferMethod } from "core/coins/ALEO/types/TransferMethod";
import { ChainUniqueId } from "core/types/ChainUniqueId";
import { AleoGasFee } from "core/types/GasFee";
import { parseUnits } from "ethers/lib/utils";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";

function SendScreen() {
  const navigate = useNavigate();
  const { popupServerClient } = useClient();
  const { selectedAccount, uniqueId } = useCurrAccount();
  const coinBasic = useCoinBasic(uniqueId);
  const { coinService, chainConfig, nativeCurrency } = useCoinService(uniqueId);
  const { balance, loadingBalance } = useBalance(
    uniqueId,
    selectedAccount.address,
  );
  const [step, setStep] = useState(1);

  return <PageWithHeader enableBack title={"Send"}></PageWithHeader>;
}

export default SendScreen;
