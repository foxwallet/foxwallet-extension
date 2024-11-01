import {
  ChakraComponent,
  chakra,
  useColorModeValue,
  useStyleConfig,
} from "@chakra-ui/react";
import CheckCircle from "@/common/assets/image/icon_check_circle.svg";
import CheckLine from "@/common/assets/image/icon_check_line.svg";
import CloseLine from "@/common/assets/image/icon_close_line.svg";
import CloseCircle from "@/common/assets/image/icon_close_circle.svg";
import EyeClose from "@/common/assets/image/icon_eye_close.svg";
import Eye from "@/common/assets/image/icon_eye_on.svg";
import Left from "@/common/assets/image/icon_left.svg";
import Logo from "@/common/assets/image/onboard_logo.svg";
import PreventScreenshot from "@/common/assets/image/icon_prevent_screenshot.svg";
import ArrowRight from "@/common/assets/image/icon_arrow_right.svg";
import LogoNew from "@/common/assets/image/icon_logo.svg";
import Copy from "@/common/assets/image/icon_copy.svg";
import Receive from "@/common/assets/image/icon_receive.svg";
import Send from "@/common/assets/image/icon_send.svg";
import Stake from "@/common/assets/image/icon_stake.svg";
import BuyDisabled from "@/common/assets/image/icon_buy_disabled.svg";
import SwapDisabled from "@/common/assets/image/icon_swap_disabled.svg";
import ArrowBackup from "@/common/assets/image/icon_arrow_backup.svg";
import BackupReminder from "@/common/assets/image/icon_backup_reminder.svg";
import CloseLineGray from "@/common/assets/image/icon_close_line_gray.svg";
import WalletSelected from "@/common/assets/image/icon_wallet_selected.svg";
import WalletUnselected from "@/common/assets/image/icon_wallet_unselected.svg";
import SettingSelected from "@/common/assets/image/icon_setting_selected.svg";
import SettingUnselected from "@/common/assets/image/icon_setting_unselected.svg";
import Aleo from "@/common/assets/image/icon_aleo.svg";
import CloseLineBlack from "@/common/assets/image/icon_close_black.svg";
import Warning from "@/common/assets/image/icon_warning.svg";
import Share from "@/common/assets/image/icon_share.svg";
import CopyBlack from "@/common/assets/image/icon_copy_black.svg";
import CheckLineBlack from "@/common/assets/image/icon_check_line_black.svg";
import FoxWallet from "@/common/assets/image/icon_foxwallet.svg";
import ChevronLeft from "@/common/assets/image/icon_chevron_left.svg";
import ChevronRight from "@/common/assets/image/icon_chevron_right.svg";
import ChevronUp from "@/common/assets/image/icon_chevron_up.svg";
import ChevronDown from "@/common/assets/image/icon_chevron_down.svg";
import Wallet from "@/common/assets/image/icon_wallet.svg";
import Edit from "@/common/assets/image/icon_edit.svg";
import More from "@/common/assets/image/icon_more.svg";
import ExportPhrase from "@/common/assets/image/icon_export_phrase.svg";
import Delete from "@/common/assets/image/icon_delete.svg";
import QuestionCircle from "@/common/assets/image/icon_question_circle.svg";
import CheckCircleBlack from "@/common/assets/image/icon_check_circle_black.svg";
import UncheckCircleGray from "@/common/assets/image/icon_uncheck_circle_gray.svg";
import Rescan from "@/common/assets/image/icon_rescan.svg";
import Loading from "@/common/assets/image/icon_loading.svg";
import EmptyTxPlaceholder from "@/common/assets/image/icon_empty_tx.svg";
import SendBlack from "@/common/assets/image/icon_send_black.svg";
import ReceiveBlack from "@/common/assets/image/icon_receive_black.svg";
import Guide from "@/common/assets/image/icon_guide.svg";
import Community from "@/common/assets/image/icon_community.svg";
import SecurityTips from "@/common/assets/image/icon_security_tips.svg";
import Settings from "@/common/assets/image/icon_settings.svg";
import Telegram from "@/common/assets/image/icon_telegram.svg";
import Medium from "@/common/assets/image/icon_medium.svg";
import Twitter from "@/common/assets/image/icon_twitter.svg";
import Discord from "@/common/assets/image/icon_discord.svg";
import Youtube from "@/common/assets/image/icon_youtube.svg";
import Language from "@/common/assets/image/icon_language.svg";
import Currency from "@/common/assets/image/icon_currency.svg";
import Info from "@/common/assets/image/icon_info.svg";
import Web from "@/common/assets/image/icon_web.svg";
import MeSelected from "@/common/assets/image/icon_me_selected.svg";
import MeUnselected from "@/common/assets/image/icon_me_unselected.svg";
import Reset from "@/common/assets/image/icon_reset.svg";
import Lock from "@/common/assets/image/icon_lock.svg";
import Faucet from "@/common/assets/image/icon_faucet.svg";
import JoinSplit from "@/common/assets/image/icon_join_split.svg";
import UpgradeReminder from "@/common/assets/image/icon_upgrade_reminder.svg";
import UpgradeReminderDark from "@/common/assets/image/icon_upgrade_reminder_dark.svg";
import AddCircle from "@/common/assets/image/icon_add_circle.svg";
import RemoveCircle from "@/common/assets/image/icon_remove_circle.svg";
import Search from "@/common/assets/image/icon_search_line.svg";

const ThemeIconFill: (i: any) => ChakraComponent<any, any> =
  (icon: any) => (props: ChakraComponent<any, any>) => {
    const styles = useStyleConfig("SvgIcon");
    const OriginIcon = chakra(icon);
    return <OriginIcon __css={styles} {...props} />;
  };

const ThemeIconStroke: (i: any) => ChakraComponent<any, any> =
  (icon: any) => (props: ChakraComponent<any, any>) => {
    const iconStrokeColor = useColorModeValue("black", "white");

    const OriginIcon = chakra(icon);
    return <OriginIcon stroke={iconStrokeColor} {...props} />;
  };

export const IconCheckCircle = chakra(CheckCircle);
export const IconCheckLine = chakra(CheckLine);
export const IconCloseLine = ThemeIconFill(CloseLine);
export const IconEyeClose = ThemeIconFill(EyeClose);
export const IconEyeOn = ThemeIconFill(Eye);
export const IconLeft = ThemeIconFill(Left);
export const OnboardLogo = chakra(Logo);
export const IconPreventScreenshot = chakra(PreventScreenshot);
export const IconCloseCircle = chakra(CloseCircle);
export const IconArrowRight = ThemeIconFill(ArrowRight);
export const IconLogo = chakra(LogoNew);
export const IconCopy = ThemeIconFill(Copy);
export const IconReceive = chakra(Receive);
export const IconSend = chakra(Send);
export const IconStake = chakra(Stake);
export const IconFaucet = chakra(Faucet);
export const IconJoinSplit = chakra(JoinSplit);
export const IconBuyDisabled = chakra(BuyDisabled);
export const IconSwapDisabled = chakra(SwapDisabled);
export const IconArrowBackup = chakra(ArrowBackup);
export const IconBackupReminder = chakra(BackupReminder);
export const IconCloseLineGray = chakra(CloseLineGray);
export const IconWalletSelected = ThemeIconFill(WalletSelected);
export const IconWalletUnselected = ThemeIconFill(WalletUnselected);
export const IconSettingSelected = chakra(SettingSelected);
export const IconSettingUnselected = chakra(SettingUnselected);
export const IconAleo = chakra(Aleo);
export const IconCloseLineBlack = ThemeIconFill(CloseLineBlack);
export const IconWarning = chakra(Warning);
export const IconShare = chakra(Share);
export const IconCopyBlack = ThemeIconFill(CopyBlack);
export const IconCheckLineBlack = ThemeIconFill(CheckLineBlack);
export const IconFoxWallet = ThemeIconFill(FoxWallet);
export const IconChevronLeft = ThemeIconFill(ChevronLeft);
export const IconChevronRight = ThemeIconFill(ChevronRight);
export const IconChevronUp = ThemeIconFill(ChevronUp);
export const IconChevronDown = ThemeIconFill(ChevronDown);
export const IconWallet = ThemeIconFill(Wallet);
export const IconEdit = ThemeIconFill(Edit);
export const IconMore = ThemeIconFill(More);
export const IconExportPhrase = ThemeIconFill(ExportPhrase);
export const IconDelete = chakra(Delete);
export const IconQuestionCircle = chakra(QuestionCircle);
export const IconCheckCircleBlack = chakra(CheckCircleBlack);
export const IconUncheckCircleGray = chakra(UncheckCircleGray);
export const IconRescan = ThemeIconFill(Rescan);
export const IconLoading = ThemeIconFill(Loading);
export const IconEmptyTxPlaceholder = chakra(EmptyTxPlaceholder);
export const IconSendBlack = chakra(SendBlack);
export const IconReceiveBlack = chakra(ReceiveBlack);
export const IconGuide = ThemeIconFill(Guide);
export const IconCommunity = ThemeIconFill(Community);
export const IconSecurityTips = ThemeIconFill(SecurityTips);
export const IconSettings = ThemeIconFill(Settings);
export const IconTelegram = ThemeIconFill(Telegram);
export const IconMedium = ThemeIconFill(Medium);
export const IconTwitter = ThemeIconFill(Twitter);
export const IconDiscord = ThemeIconFill(Discord);
export const IconYoutube = ThemeIconFill(Youtube);
export const IconLanguage = ThemeIconFill(Language);
export const IconCurrency = chakra(Currency);
export const IconInfo = ThemeIconFill(Info);
export const IconWeb = chakra(Web);
export const IconMeSelected = ThemeIconFill(MeSelected);
export const IconMeUnselected = ThemeIconFill(MeUnselected);
export const IconReset = ThemeIconStroke(Reset);
export const IconLock = ThemeIconStroke(Lock);
export const IconUpgradeReminder = chakra(UpgradeReminder);
export const IconUpgradeReminderDark = chakra(UpgradeReminderDark);
export const IconAddCircle = ThemeIconStroke(AddCircle);
export const IconRemoveCircle = ThemeIconStroke(RemoveCircle);
export const IconSearch = ThemeIconStroke(Search);
