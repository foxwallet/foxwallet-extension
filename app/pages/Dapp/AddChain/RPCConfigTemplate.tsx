import { type ChainBaseConfig } from "core/types/ChainBaseConfig";
import { useTranslation } from "react-i18next";
import type React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import {
  IconDelete,
  IconFoxWallet,
  IconLogo,
  IconMore,
  IconRemoveCircle,
} from "@/components/Custom/Icon";
import { type ETHConfig } from "core/coins/ETH/types/ETHConfig";
import type { Currency } from "core/types/Currency";
import { useDebounce } from "use-debounce";
import validUrl from "valid-url";
import { getChainConfigsByFilter } from "@/hooks/useGroupAccount";
import { CoinType } from "core/types";
import { JsonRpcProvider as EthRpcProvider } from "@ethersproject/providers";
import { isEthCustomRPC, parseEthChainId } from "core/coins/ETH/utils";
import { formatCustomEthRpcUniqueId } from "core/helper/ChainUniqueId";
import EVMPlaceHolder from "core/assets/images/chains/placeholder.webp";
import { ResponsiveFlex } from "@/components/Custom/ResponsiveFlex";
import { H6 } from "@/common/theme/components/text";
import { DappInfo } from "@/components/Dapp/DappInfo";
import { BaseInput } from "@/components/Custom/Input";
import { type SiteInfo } from "@/scripts/content/host";
import { Header } from "@/components/Custom/Header";
import { type AleoConfig } from "core/coins/ALEO/types/AleoConfig";
import { AleoRpc } from "core/coins/ALEO/service/api/rpc";
import { Page } from "@/layouts/Page";
import { Content } from "@/layouts/Content";
import Hover from "@/components/Custom/Hover";
import { showConfirmDialog } from "@/components/Custom/ConfirmDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core/dist/types";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

type IProps = {
  // 已有RPC，新增时为空
  defaultConf?: ChainBaseConfig;

  // 编辑已有RPC触发
  onChanged?: (newConfig: ChainBaseConfig) => void;
  // 删除已有RPC
  onDelete?: () => void;
  // 提交新RPC
  submitNew?: (chainConfig: ChainBaseConfig) => void;

  browserAdd?: boolean;
  onCancel?: () => void;

  siteInfo?: SiteInfo;
};

enum RPCStatus {
  SUCCESS = "success",
  FAILED = "failed",
}
type RPCHealth = {
  height: number;
  latency: number;
  status: RPCStatus;
};
function RPCItem({
  rpcUrl,
  itemHealth,
  onRemove,
}: {
  rpcUrl: string;
  itemHealth?: RPCHealth;
  onRemove: (rpcUrl: string) => void;
}) {
  const { t } = useTranslation();
  const isBuiltInRPC = useCallback((url: string) => {
    return true;
  }, []);
  const rpcUrlToDisplay = useCallback(
    (url: string) => {
      const isBuiltIn = isBuiltInRPC(url);
      if (isBuiltIn) {
        const urlObj = new URL(url);
        return urlObj.origin;
      }
      return url;
    },
    [isBuiltInRPC],
  );

  const latencyColor = useCallback((health: RPCHealth | undefined) => {
    if (!health) {
      return "#9395A4";
    }
    switch (health.status) {
      case RPCStatus.FAILED:
        return "#EF466F";
      case RPCStatus.SUCCESS: {
        if (health.latency < 500) {
          return "#5FC88F";
        }
        if (health.latency < 1500) {
          return "#DADB48";
        }
        return "#F4B33E";
      }
    }
  }, []);

  const latencyText = useCallback(
    (health: RPCHealth | undefined) => {
      if (!health) {
        return t("Networks:loading");
      }
      switch (health.status) {
        case RPCStatus.FAILED:
          return t("Networks:unavailable");
        case RPCStatus.SUCCESS: {
          return health.latency.toString() + "ms";
        }
      }
    },
    [t],
  );
  const onRemoveClick = useCallback(() => {
    onRemove(rpcUrl);
  }, [onRemove, rpcUrl]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: rpcUrl });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={{ ...style, position: "relative" }}>
      <Flex
        key={rpcUrl}
        flexDirection={"column"}
        backgroundColor={"#F9F9F9"}
        my={1}
        px={2}
        py={2}
        {...attributes}
        {...listeners}
      >
        <Flex alignItems={"center"} justifyContent="space-between">
          <Text flex={1} overflow={"hidden"} mr={10}>
            {rpcUrlToDisplay(rpcUrl)}
          </Text>
        </Flex>
        <Flex alignItems={"center"} justifyContent="space-between">
          <Text color={"#777E90"}>
            {t("Networks:height", {
              height:
                itemHealth?.status === RPCStatus.SUCCESS
                  ? itemHealth?.height.toString()
                  : "...",
            })}
          </Text>
          <Text color={latencyColor(itemHealth)}>
            {latencyText(itemHealth)}
          </Text>
        </Flex>
      </Flex>
      <Flex
        position={"absolute"}
        right={2}
        top={3}
        cursor={"pointer"}
        onClick={onRemoveClick}
      >
        <IconRemoveCircle w={4} h={4} />
      </Flex>
    </div>
  );
}

const RPCConfigTemplate: React.FC<IProps> = (props: IProps) => {
  const { onDelete, onCancel, submitNew, onChanged, browserAdd } = props;
  const {
    chainId,
    chainName: defaultChainName,
    nativeCurrency: defaultNativeCurrency,
    rpcList: oriRpcList = [],
    explorerUrls,
  } = (props.defaultConf as ETHConfig) || {};
  const { t } = useTranslation();

  const coinType = useMemo(() => {
    console.log("defaultConf", props.defaultConf);
    return props.defaultConf?.coinType ?? CoinType.ETH;
  }, [props.defaultConf]);

  const [rpcHealthMap, setRPCHealthMap] = useState<Map<string, RPCHealth>>(
    new Map(),
  );
  const [chainName, setChainName] = useState(defaultChainName);
  const [nativeCurrency, setNativeCurrency] = useState<Currency>(
    defaultNativeCurrency as Currency,
  );
  const onChangeChainName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setChainName(event.target.value.trimStart());
    },
    [],
  );
  const isInvalidName = useMemo(() => {
    return !chainName;
  }, [chainName]);
  const onChangeNativeCurrency = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNativeCurrency((prev) => ({
        ...prev,
        symbol: event.target.value.trim(),
      }));
    },
    [],
  );

  const [newRPCUrl, setNewRPCUrl] = useState<string>("");
  const [debounceRpcUrl] = useDebounce(newRPCUrl, 500);
  const [rpcUrls, setRpcUrls] = useState(
    oriRpcList.filter((it) => validUrl.isHttpsUri(it)),
  );
  const [rpcsChecked, setRpcsChecked] = useState(false);

  const isRpcUrlDup = useMemo(() => {
    if (!rpcUrls) {
      return false;
    }
    return rpcUrls.some((url, i) => {
      try {
        return url.trim() === debounceRpcUrl.trim();
      } catch (err) {
        console.log(i, err);
        return false;
      }
    });
  }, [debounceRpcUrl, rpcUrls]);

  const isRpcUrlValidHttps = useMemo(() => {
    return !!validUrl.isHttpsUri(debounceRpcUrl);
  }, [debounceRpcUrl]);

  const dupCheck = useCallback(
    ({ name, chainIdStr }: { name?: string; chainIdStr?: string }) => {
      const matchingConfig = getChainConfigsByFilter({
        filter: (item: ChainBaseConfig) => {
          if (item.coinType !== CoinType.ETH) {
            return false;
          }
          if (chainIdStr) {
            if ((item as ETHConfig).chainId === chainIdStr) {
              return true;
            }
          }
          if (name) {
            if ((item as ETHConfig).chainName === name) {
              return true;
            }
          }
          return false;
        },
      });
      return matchingConfig.length > 0;
    },
    [],
  );

  const getRPCHeight = useCallback(
    async (rpcUrl: string): Promise<number> => {
      switch (coinType) {
        case CoinType.ETH: {
          const chainIdNum = Number(chainId);
          const provider = new EthRpcProvider(
            { url: rpcUrl, timeout: 5000 },
            chainIdNum,
          );
          return await provider.getBlockNumber();
        }
        case CoinType.ALEO: {
          if (props.defaultConf) {
            const provider = new AleoRpc(
              rpcUrl,
              (props.defaultConf as AleoConfig).chainId,
            );
            return await provider.getLatestHeight();
          } else {
            throw new Error(`coinType ${coinType} requires defaultConf`);
          }
        }
        default:
          throw new Error(`unsupported coinType ${coinType}`);
      }
    },
    [chainId, coinType, props.defaultConf],
  );

  useEffect(() => {
    const addToRPCList = (rpcUrl: string) => {
      if (!rpcUrls.some((it) => it === rpcUrl)) {
        const newRpcList = [rpcUrl, ...rpcUrls];
        setRpcUrls(newRpcList);
        setNewRPCUrl("");
      }
    };
    const checkAndAddRPC = async () => {
      if (coinType === CoinType.ETH) {
        const instance = new EthRpcProvider(debounceRpcUrl);
        const _rpcChainId: string = await instance.send("eth_chainId", []);
        const { valid, chainId: formattedChainId } =
          parseEthChainId(_rpcChainId);
        const _chainId = formattedChainId.toString();
        let isGoodRPC = valid;
        const chainIdNum = Number(chainId);
        if (valid) {
          if (!chainId) {
            // 新增的自定义RPC
            isGoodRPC = !dupCheck({ chainIdStr: _chainId });
          } else {
            isGoodRPC = _chainId === `${chainIdNum}`;
          }
          if (isGoodRPC) {
            addToRPCList(debounceRpcUrl);
          }
        }
      } else {
        try {
          await getRPCHeight(debounceRpcUrl);
          addToRPCList(debounceRpcUrl);
        } catch (e) {}
      }
    };
    if (isRpcUrlValidHttps && !isRpcUrlDup) {
      void checkAndAddRPC();
    }
  }, [
    chainId,
    coinType,
    debounceRpcUrl,
    dupCheck,
    getRPCHeight,
    isRpcUrlDup,
    isRpcUrlValidHttps,
    rpcUrls,
  ]);

  useEffect(() => {
    const getAllHeightAndLatency = async () => {
      if (!rpcUrls) {
        return;
      }
      // const newHealthMap: IMap<RPCHealth> = {};
      await Promise.all(
        rpcUrls.map(async (rpcUrl) => {
          if (rpcHealthMap.get(rpcUrl)?.status === RPCStatus.SUCCESS) {
            return;
          }
          let height: number = -1;
          const startTime = new Date().getTime();
          try {
            height = (await Promise.race([
              getRPCHeight(rpcUrl),
              new Promise((_, reject) =>
                setTimeout(() => {
                  reject(new Error("Timeout"));
                }, 5000),
              ),
            ])) as number;
          } catch (e) {
            console.log("error when getBlockNumber", e);
          }
          const latency = new Date().getTime() - startTime;
          setRPCHealthMap((prev) => {
            if (prev.get(rpcUrl)?.status === RPCStatus.SUCCESS) {
              return prev;
            }
            return new Map(prev).set(rpcUrl, {
              height,
              latency,
              status: height > 1 ? RPCStatus.SUCCESS : RPCStatus.FAILED,
            });
          });
        }),
      );
    };
    getAllHeightAndLatency().then(() => {
      if (rpcUrls) {
        setRpcsChecked(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getRPCHeight, rpcUrls]);

  const onConfirm = useCallback(async () => {
    if (!submitNew) {
      return;
    }
    if (coinType !== CoinType.ETH) {
      const newChainConfig1: ChainBaseConfig = {
        ...(props.defaultConf as ChainBaseConfig),
        rpcList: rpcUrls,
      };
      submitNew?.(newChainConfig1);
      return;
    }
    const confirm = {
      ...(props.defaultConf as ETHConfig),
      rpcUrls,
      chainName: chainName.trim(),
      nativeCurrency,
    };

    const validRPCUrls =
      confirm.rpcUrls && Array.isArray(confirm.rpcUrls)
        ? confirm.rpcUrls.filter((rpcUrl: string) =>
            validUrl.isHttpsUri(rpcUrl),
          )
        : [];
    if (confirm.uniqueId) {
      const newChainConfig: ETHConfig = {
        ...(props.defaultConf as ETHConfig),
        chainName: confirm.chainName,
        nativeCurrency: confirm.nativeCurrency,
        rpcList: validRPCUrls,
      };
      submitNew?.(newChainConfig);
      return;
    }

    const chainIdRes = parseEthChainId(confirm.chainId);
    const uniqueId = formatCustomEthRpcUniqueId(chainIdRes.chainId);
    const newChainConfig: ETHConfig = {
      coinType: CoinType.ETH,
      logo: EVMPlaceHolder,
      uniqueId,
      chainId: chainIdRes.chainId.toString(),
      chainName: confirm.chainName,
      rpcList: validRPCUrls,
      nativeCurrency: confirm.nativeCurrency || {
        name: "Eth",
        decimals: 18,
        symbol: "ETH",
      },
      explorerUrls,
    };
    submitNew?.(newChainConfig);
  }, [
    coinType,
    submitNew,
    props.defaultConf,
    rpcUrls,
    chainName,
    nativeCurrency,
    explorerUrls,
  ]);

  const onRemoveRpc = useCallback((rpcUrl: string) => {
    setRpcUrls((prev) => prev.filter((it) => it !== rpcUrl));
  }, []);

  const isCustomChain = useMemo(() => {
    if (!props.defaultConf) {
      return true;
    }
    return isEthCustomRPC(props.defaultConf.uniqueId);
  }, [props.defaultConf]);

  const displayChainId = useMemo(() => {
    if (coinType === CoinType.ETH) {
      if (!chainId) {
        return "";
      }
      return parseEthChainId(chainId).chainId;
    }
    return (props.defaultConf as AleoConfig | ETHConfig).chainId;
  }, [chainId, coinType, props.defaultConf]);

  const onRemove = useCallback(async () => {
    const { confirmed } = await showConfirmDialog({
      content: t("Networks:deleteWarning"),
      confirmLabel: t("Common:delete"),
    });
    if (confirmed) {
      onDelete?.();
    }
  }, [onDelete, t]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setRpcUrls((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over!.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setDragging(event.active.id as string); // Store the dragged item
  };

  return (
    <Page>
      {!browserAdd && (
        <Header
          title={t("Networks:networkDetail")}
          rightIcon={
            isCustomChain ? (
              <Hover onClick={onRemove}>
                <IconDelete />
              </Hover>
            ) : null
          }
        />
      )}
      <Flex
        alignSelf={"stretch"}
        flexDir={"column"}
        flex={1}
        overflowY={"auto"}
        maxHeight={"calc(100vh - 120px)"}
        px={5}
      >
        {browserAdd && (
          <>
            <Flex
              justify={"center"}
              align={"center"}
              mb={3}
              alignSelf={"flex-start"}
            >
              <IconLogo mr={2} />
              <IconFoxWallet />
            </Flex>
            <H6 mt={3} mb={3}>
              {browserAdd
                ? t("Dapp:addChain", { CHAIN: defaultChainName })
                : "Edit Chain"}
            </H6>

            {!!props?.siteInfo && <DappInfo siteInfo={props.siteInfo} />}
          </>
        )}
        <Flex flexDir={"column"}>
          <BaseInput
            title={t("Networks:networkName")}
            container={{ mt: "2" }}
            value={chainName}
            onChange={onChangeChainName}
            isInvalid={isInvalidName}
            isDisabled={!isCustomChain}
          />
          <BaseInput
            title={t("Networks:symbol")}
            container={{ mt: "2" }}
            value={nativeCurrency.symbol}
            onChange={onChangeNativeCurrency}
            isInvalid={!nativeCurrency.symbol}
            isDisabled={!isCustomChain}
          />
          <Flex mt={2} alignItems={"center"} justifyContent="space-between">
            <H6 mb={"2"}>{t("Networks:chainId")}</H6>
            <Text>{displayChainId}</Text>
          </Flex>
          <BaseInput
            title={t("Networks:rpc")}
            placeholder={t("Networks:rpcHint")}
            container={{ mt: "2" }}
            value={newRPCUrl}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNewRPCUrl(event.target.value.trim());
            }}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={rpcUrls}
              strategy={verticalListSortingStrategy}
            >
              {rpcUrls.map((rpcUrl: string) => {
                const itemHealth = rpcHealthMap.get(rpcUrl);
                return (
                  <RPCItem
                    itemHealth={itemHealth}
                    key={rpcUrl}
                    rpcUrl={rpcUrl}
                    onRemove={onRemoveRpc}
                  />
                );
              })}
            </SortableContext>
            <DragOverlay>
              {dragging ? (
                <RPCItem
                  itemHealth={rpcHealthMap.get(dragging)}
                  key={dragging}
                  rpcUrl={dragging}
                  onRemove={onRemoveRpc}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </Flex>
        <Flex
          mt={3}
          position={"fixed"}
          left={5}
          right={5}
          bottom={5}
          justify={"center"}
        >
          <ResponsiveFlex flexDir={"column"}>
            <Flex alignSelf={"stretch"}>
              <Button
                onClick={props.onCancel}
                flex={1}
                colorScheme="secondary"
                mr={2}
              >
                {t("Common:cancel")}
              </Button>
              <Button onClick={onConfirm} flex={1} ml={"2"}>
                {t("Common:confirm")}
              </Button>
            </Flex>
          </ResponsiveFlex>
        </Flex>
      </Flex>
    </Page>
  );
};

export default RPCConfigTemplate;
