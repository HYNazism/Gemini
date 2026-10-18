/**
 * Regional Ad Network Router (Google AdMob + Iranian Tapsell Plus & Yektanet),
 * Live Ad Overlay Simulator, PWA Installer, and Automated GitHub Subfolder & APK Manager.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Gift,
  GitBranch,
  FolderGit2,
  UploadCloud,
  Globe,
} from 'lucide-react';
import { admob, type AdMobConfig, type ActiveAdOverlay } from '../game/admob';
import { resolveAdNetworkByCountry, type AdNetworkProvider, type AdRoutingMode } from '../game/rules';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface GitStatusInfo {
  commitHash: string;
  commitCount: number;
  versionTag: string;
  nextVersionTag: string;
  lastCommitMsg: string;
  lastCommitTime: string;
  subfolder: string;
  repoName: string;
  hasGithubToken: boolean;
  githubUser: string;
}

interface ReleaseAndAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantBonusSeeds: () => void;
}

export const ReleaseAndAdsModal: React.FC<ReleaseAndAdsModalProps> = ({
  isOpen,
  onClose,
  onGrantBonusSeeds,
}) => {
  const [config, setConfig] = useState<AdMobConfig>(() => admob.getConfig());
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'admob' | 'apk'>('admob');
  const [providerSubTab, setProviderSubTab] = useState<'tapsell' | 'yektanet' | 'admob'>('tapsell');
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const [gitStatus, setGitStatus] = useState<GitStatusInfo | null>(null);
  const [repoName, setRepoName] = useState('sproutling-grove-guardian-3d');
  const [subfolder, setSubfolder] = useState('sproutling-android-release');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    ok: boolean;
    message: string;
    repoUrl?: string;
    subfolderUrl?: string;
    releasesUrl?: string;
  } | null>(null);

  const fetchGitStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/github/status');
      if (res.ok) {
        const data = (await res.json()) as GitStatusInfo;
        setGitStatus(data);
        if (data.repoName) setRepoName(data.repoName);
        if (data.subfolder) setSubfolder(data.subfolder);
      }
    } catch {
      // ignore offline or static preview
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setConfig(admob.getConfig());
      setStatusMsg(null);
      setPublishResult(null);
      fetchGitStatus();
    }
  }, [isOpen, fetchGitStatus]);

  if (!isOpen) return null;

  const tz =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || '' : '';
  const langs =
    typeof navigator !== 'undefined'
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language || '']
      : [];

  const liveRouting = resolveAdNetworkByCountry({
    mode: config.routingMode,
    preferredIranProvider: config.preferredIranProvider,
    countryCodeHint: config.countryCodeOverride,
    timeZone: tz,
    languages: langs,
    primaryFailed: config.simulatePrimaryFailure,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = admob.saveConfig(config);
    if (!res.valid) {
      setStatusMsg({ type: 'err', text: res.error || 'خطا در اعتبارسنجی شناسه‌ها' });
    } else {
      setStatusMsg({
        type: 'ok',
        text: `تنظیمات مسیریابی تبلیغات ذخیره شد. شبکه فعال فعلی: ${liveRouting.activeProvider.toUpperCase()} (${liveRouting.detectedCountry})`,
      });
    }
  };

  const handleResetTest = () => {
    const def = admob.resetToTestIds();
    setConfig(def);
    setStatusMsg({
      type: 'ok',
      text: 'شناسه‌های آزمایشی استاندارد (AdMob، تپسل پلاس و یکتانت) بازیابی شدند.',
    });
  };

  const handleTestRewardedAd = (explicitProvider?: AdNetworkProvider) => {
    admob.saveConfig(config);
    onClose();
    admob.showRewardedAd(
      '+3 Golden Sun-Seeds',
      () => {
        onGrantBonusSeeds();
      },
      undefined,
      explicitProvider
    );
  };

  const handleSyncAndPublishGitHub = async () => {
    setIsPublishing(true);
    setPublishResult(null);
    try {
      const res = await fetch('/api/github/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          subfolder,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPublishResult({
          ok: true,
          message: data.message,
          repoUrl: data.repoUrl,
          subfolderUrl: data.subfolderUrl,
          releasesUrl: data.releasesUrl,
        });
        if (data.status) setGitStatus(data.status);
      } else {
        setPublishResult({
          ok: false,
          message: data.error || 'خطا در همگام‌سازی و انتشار گیت‌هاب',
        });
      }
    } catch {
      setPublishResult({
        ok: false,
        message: 'خطا در ارتباط با سرور محلی Git',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyBuildCommands = () => {
    const cmds = [
      `# Sync subfolder (${subfolder}), commit new version tag, and push to GitHub (${repoName}):`,
      `bash ./${subfolder}/sync-and-publish-github.sh`,
      '',
      '# Or build APK & Google Play AAB locally:',
      `bash ./${subfolder}/build-android-apk.sh`,
    ].join('\n');
    navigator.clipboard?.writeText(cmds);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div
      role="dialog"
      dir="rtl"
      aria-label="Regional Ad Networks (AdMob, Tapsell, Yektanet) and APK Build Configuration"
      className="fixed inset-0 z-50 bg-[#07130c]/85 flex items-center justify-center p-3 sm:p-6 select-none pointer-events-auto"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#1b4332] border-2 border-[#709775] rounded-3xl p-4 sm:p-6 shadow-2xl text-[#e9f5db] flex flex-col gap-3.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d6a4f] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] border border-[#95d5b2]/50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#ffd166]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                تبلیغات منطقه‌ای (تپسل · یکتانت · AdMob) و خروجی APK
              </h2>
              <p className="text-[11px] text-[#95d5b2]">
                اکانت ناشر: <span className="font-mono text-[#ffd166]">{config.publisherEmail}</span>
                {gitStatus && (
                  <span className="mr-2 px-2 py-0.5 rounded bg-[#0f281e] text-[#06d6a0] font-mono text-[10px]">
                    {gitStatus.versionTag} ({gitStatus.commitHash})
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration modal"
            className="w-8 h-8 rounded-lg bg-[#2d6a4f] hover:bg-[#40916c] flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#0f281e] p-1 rounded-xl border border-[#2d6a4f]">
          <button
            type="button"
            onClick={() => setActiveTab('admob')}
            className={`py-2 rounded-lg text-xs font-black tracking-wide transition-colors cursor-pointer ${
              activeTab === 'admob'
                ? 'bg-[#52b788] text-[#081c15]'
                : 'text-[#95d5b2] hover:text-white'
            }`}
          >
            ۱. مسیریاب هوشمند کشور (تپسل / یکتانت / AdMob)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`py-2 rounded-lg text-xs font-black tracking-wide transition-colors cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-[#52b788] text-[#081c15]'
                : 'text-[#95d5b2] hover:text-white'
            }`}
          >
            ۲. انتشار GitHub / Subfolder / APK
          </button>
        </div>

        {activeTab === 'admob' ? (
          <form onSubmit={handleSave} className="flex flex-col gap-3 text-xs">
            {/* Live Country & Active Network Status Banner */}
            <div className="bg-[#0f281e] border border-[#06d6a0]/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#06d6a0] shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-white text-xs flex flex-wrap items-center gap-1.5">
                    <span>وضعیت تشخیص کشور و شبکه فعال:</span>
                    <span className="px-2 py-0.5 rounded bg-[#1b4332] text-[#ffd166] font-bold text-[11px]">
                      {liveRouting.detectedCountry === 'IR' ? '🇮🇷 ایران (IR)' : '🌍 بین‌الملل (GLOBAL)'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#06d6a0] text-[#081c15] font-black text-[11px]">
                      شبکه فعال: {liveRouting.activeProvider.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#2d6a4f] text-[#d8f3dc] text-[10px]">
                      پشتیبان (Fallback): {liveRouting.fallbackProvider.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#95d5b2] mt-1">{liveRouting.reasonFa}</p>
                </div>
              </div>
            </div>

            {/* Country & Routing Mode Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f]">
              <div>
                <label className="block text-[10px] font-bold text-[#95d5b2] mb-1">
                  حالت انتخاب شبکه (Routing Mode)
                </label>
                <select
                  aria-label="Ad Network Routing Mode"
                  value={config.routingMode}
                  onChange={(e) =>
                    setConfig({ ...config, routingMode: e.target.value as AdRoutingMode })
                  }
                  className="w-full bg-[#1b4332] border border-[#40916c] rounded-lg ps-2.5 pe-7 py-1.5 text-white font-bold text-xs"
                >
                  <option value="auto">خودکار بر اساس کشور (Auto Geo)</option>
                  <option value="tapsell">اجبار به تپسل پلاس (Tapsell Plus)</option>
                  <option value="yektanet">اجبار به یکتانت (Yektanet)</option>
                  <option value="admob">اجبار به گوگل ادموب (Google AdMob)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#95d5b2] mb-1">
                  شبکه اولویت اول داخل ایران (IR)
                </label>
                <select
                  aria-label="Preferred Iran Ad Network"
                  value={config.preferredIranProvider}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      preferredIranProvider: e.target.value as 'tapsell' | 'yektanet',
                    })
                  }
                  className="w-full bg-[#1b4332] border border-[#40916c] rounded-lg ps-2.5 pe-7 py-1.5 text-white font-bold text-xs"
                >
                  <option value="tapsell">تپسل پلاس (اولویت اول) ← یکتانت (جایگزین)</option>
                  <option value="yektanet">یکتانت (اولویت اول) ← تپسل پلاس (جایگزین)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#95d5b2] mb-1">
                  شبیه‌سازی کشور اجرا (Country Test)
                </label>
                <select
                  aria-label="Simulated Country Code"
                  value={config.countryCodeOverride}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      countryCodeOverride: e.target.value as '' | 'IR' | 'GLOBAL',
                    })
                  }
                  className="w-full bg-[#1b4332] border border-[#40916c] rounded-lg ps-2.5 pe-7 py-1.5 text-white font-bold text-xs"
                >
                  <option value="">تشخیص خودکار از Timezone/Locale</option>
                  <option value="IR">شبیه‌سازی داخل ایران (IR)</option>
                  <option value="GLOBAL">شبیه‌سازی خارج از کشور (GLOBAL)</option>
                </select>
              </div>
            </div>

            {/* Provider Sub-Tabs for Credentials */}
            <div className="flex items-center gap-1.5 bg-[#0f281e] p-1 rounded-xl border border-[#2d6a4f]">
              {[
                { id: 'tapsell' as const, label: 'شناسه تپسل پلاس (Tapsell)' },
                { id: 'yektanet' as const, label: 'شناسه یکتانت (Yektanet)' },
                { id: 'admob' as const, label: 'شناسه گوگل ادموب (AdMob)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProviderSubTab(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                    providerSubTab === tab.id
                      ? 'bg-[#ffd166] text-[#081c15]'
                      : 'text-[#95d5b2] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-Tab 1: Tapsell Plus (Iran) */}
            {providerSubTab === 'tapsell' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f]" dir="ltr">
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    Tapsell Plus App Key
                  </label>
                  <input
                    type="text"
                    value={config.tapsellAppKey}
                    onChange={(e) => setConfig({ ...config, tapsellAppKey: e.target.value })}
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    Tapsell Rewarded Zone ID
                  </label>
                  <input
                    type="text"
                    value={config.tapsellRewardedZoneId}
                    onChange={(e) => setConfig({ ...config, tapsellRewardedZoneId: e.target.value })}
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    Tapsell Interstitial Zone ID
                  </label>
                  <input
                    type="text"
                    value={config.tapsellInterstitialZoneId}
                    onChange={(e) =>
                      setConfig({ ...config, tapsellInterstitialZoneId: e.target.value })
                    }
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Yektanet (Iran) */}
            {providerSubTab === 'yektanet' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f]" dir="ltr">
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    Yektanet App / Publisher ID
                  </label>
                  <input
                    type="text"
                    value={config.yektanetAppId}
                    onChange={(e) => setConfig({ ...config, yektanetAppId: e.target.value })}
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    Yektanet Rewarded Placement ID
                  </label>
                  <input
                    type="text"
                    value={config.yektanetRewardedPlacementId}
                    onChange={(e) =>
                      setConfig({ ...config, yektanetRewardedPlacementId: e.target.value })
                    }
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    Yektanet Native/Banner Placement
                  </label>
                  <input
                    type="text"
                    value={config.yektanetBannerPlacementId}
                    onChange={(e) =>
                      setConfig({ ...config, yektanetBannerPlacementId: e.target.value })
                    }
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Google AdMob (Global) */}
            {providerSubTab === 'admob' && (
              <div className="flex flex-col gap-2.5 bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f]" dir="ltr">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                      Android Package Name
                    </label>
                    <input
                      type="text"
                      value={config.packageName}
                      onChange={(e) => setConfig({ ...config, packageName: e.target.value })}
                      className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                      AdMob App ID (~ separator)
                    </label>
                    <input
                      type="text"
                      value={config.appId}
                      onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                      className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                      Rewarded Unit ID
                    </label>
                    <input
                      type="text"
                      value={config.rewardedAdUnitId}
                      onChange={(e) => setConfig({ ...config, rewardedAdUnitId: e.target.value })}
                      className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                      Interstitial Unit ID
                    </label>
                    <input
                      type="text"
                      value={config.interstitialAdUnitId}
                      onChange={(e) =>
                        setConfig({ ...config, interstitialAdUnitId: e.target.value })
                      }
                      className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                      Banner Unit ID
                    </label>
                    <input
                      type="text"
                      value={config.bannerAdUnitId}
                      onChange={(e) => setConfig({ ...config, bannerAdUnitId: e.target.value })}
                      className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Waterfall Fallback & Safe Test Mode Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f] cursor-pointer">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#06d6a0] shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">
                      حالت آزمایشی ایمن (Sandbox / Test Mode)
                    </span>
                    <span className="text-[10px] text-[#95d5b2]">
                      محافظت از اکانت در برابر کلیک آزمایشی
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.isTestMode}
                  onChange={(e) => setConfig({ ...config, isTestMode: e.target.checked })}
                  className="w-4 h-4 accent-[#52b788]"
                />
              </label>

              <label className="flex items-center justify-between bg-[#0f281e] p-2.5 rounded-xl border border-[#2d6a4f] cursor-pointer">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ffd166] shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">
                      تست سوییچ خودکار جایگزین (Waterfall Fallback)
                    </span>
                    <span className="text-[10px] text-[#95d5b2]">
                      شبیه‌سازی قطعی شبکه اول و اجرای خودکار جایگزین
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.simulatePrimaryFailure}
                  onChange={(e) =>
                    setConfig({ ...config, simulatePrimaryFailure: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#ffd166]"
                />
              </label>
            </div>

            {statusMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  statusMsg.type === 'ok'
                    ? 'bg-[#06d6a0]/20 text-[#06d6a0] border border-[#06d6a0]/40'
                    : 'bg-red-500/20 text-red-200 border border-red-400/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-black rounded-xl cursor-pointer"
              >
                ذخیره تنظیمات تبلیغات منطقه‌ای
              </button>

              <button
                type="button"
                onClick={handleResetTest}
                className="px-3 py-2.5 bg-[#2d6a4f] hover:bg-[#40916c] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>شناسه‌های تست</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestRewardedAd()}
                className="px-4 py-2.5 bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تست تبلیغ ({liveRouting.activeProvider.toUpperCase()} +3 بذر)</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 text-xs">
            {/* GitHub Project & Subfolder Auto-Revisioning Section */}
            <div className="bg-[#0f281e] p-3.5 rounded-xl border border-[#2d6a4f] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#ffd166]" />
                  <span className="font-bold text-white text-sm">
                    مدیریت پروژه، زیرپوشه (Subfolder) و نسخه‌بندی خودکار Git
                  </span>
                </div>
                {gitStatus && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#1b4332] border border-[#52b788]/50 text-[#06d6a0] font-mono text-[11px] flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {gitStatus.versionTag} · #{gitStatus.commitCount}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" dir="ltr">
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    GitHub Repository Name
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                    Project Subfolder in GitHub
                  </label>
                  <input
                    type="text"
                    value={subfolder}
                    onChange={(e) => setSubfolder(e.target.value)}
                    className="w-full bg-[#07130c] border border-[#40916c] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handleSyncAndPublishGitHub}
                className="w-full py-2.5 bg-[#52b788] hover:bg-[#74c69d] disabled:opacity-50 text-[#081c15] font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <UploadCloud className="w-4 h-4" />
                <span>
                  {isPublishing
                    ? 'در حال همگام‌سازی زیرپوشه و ثبت نسخه جدید...'
                    : `همگام‌سازی زیرپوشه (/${subfolder})، ثبت تگ نسخه جدید و انتشار در GitHub`}
                </span>
              </button>

              {publishResult && (
                <div
                  className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                    publishResult.ok
                      ? 'bg-[#06d6a0]/15 border-[#06d6a0]/40 text-[#d8f3dc]'
                      : 'bg-red-500/20 border-red-400/40 text-red-200'
                  }`}
                >
                  <p className="font-bold">{publishResult.message}</p>
                  {publishResult.repoUrl && (
                    <p className="mt-1 font-mono text-[10px] text-[#ffd166]" dir="ltr">
                      Repository: {publishResult.repoUrl} | Subfolder: {publishResult.subfolderUrl}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Option 1: Instant PWA Install on Android */}
            <div className="bg-[#0f281e] p-3.5 rounded-xl border border-[#2d6a4f] flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm">
                  نصب مستقیم روی اندروید (PWA / Fullscreen Offline)
                </h3>
                <p className="text-[11px] text-[#95d5b2] mt-0.5">
                  اجرای ۱۰۰٪ آفلاین بدون نیاز به اینترنت، حالت Eco برای گوشی‌های ضعیف و حالت Ultra برای گوشی‌های قوی.
                </p>
              </div>
              {isInstalled ? (
                <span className="px-3 py-1.5 bg-[#06d6a0]/20 text-[#06d6a0] font-bold rounded-lg text-[11px]">
                  نصب شده
                </span>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={install}
                  className="px-4 py-2 bg-[#ffd166] text-[#081c15] font-black rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>نصب مستقیم</span>
                </button>
              ) : (
                <span className="text-[11px] text-[#ffd166] font-semibold shrink-0" dir="ltr">
                  {isIOS ? 'Safari -> Add to Home Screen' : 'Chrome Menu -> Install App'}
                </span>
              )}
            </div>

            {/* Option 2: GitHub Actions & Capacitor APK/AAB Pipeline */}
            <div className="bg-[#0f281e] p-3.5 rounded-xl border border-[#2d6a4f] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#ffd166]">
                  اسکریپت‌های آماده در زیرپوشه <code>./{subfolder}/</code>:
                </span>
                <button
                  type="button"
                  onClick={handleCopyBuildCommands}
                  className="px-2.5 py-1 bg-[#2d6a4f] hover:bg-[#40916c] text-white rounded-lg flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-[#06d6a0]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'کپی شد' : 'کپی دستورات'}</span>
                </button>
              </div>

              <pre className="bg-[#07130c] p-2.5 rounded-lg text-[10px] font-mono text-[#95d5b2] overflow-x-auto" dir="ltr">
{`# Sync subfolder & publish new release tag to GitHub:
bash ./${subfolder}/sync-and-publish-github.sh

# Build APK & Google Play AAB locally:
bash ./${subfolder}/build-android-apk.sh`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Interactive Multi-Network Ad Overlay Simulator (Supports Tapsell Plus, Yektanet, and Google AdMob)
 */
export const AdMobSimulatorOverlay: React.FC = () => {
  const [overlay, setOverlay] = useState<ActiveAdOverlay | null>(null);

  useEffect(() => {
    return admob.subscribe(setOverlay);
  }, []);

  if (!overlay) return null;

  const providerMeta = {
    tapsell: {
      badge: 'تپسل پلاس · Tapsell Plus SDK',
      regionBadge: 'شبکه تبلیغات ویدیویی ایران (کافه‌بازار / مایکت)',
      accentColor: '#00b4d8',
      description:
        'پخش تبلیغ ویدیویی جایزه‌دار از طریق شبکه بومی «تپسل پلاس» (Tapsell Plus). مناسب برای کاربران داخل ایران بدون نیاز به تغییر IP.',
    },
    yektanet: {
      badge: 'یکتانت · Yektanet Native & Video SDK',
      regionBadge: 'شبکه تبلیغات هوشمند وب و اپلیکیشن ایران',
      accentColor: '#ffd166',
      description:
        'نمایش تبلیغ جایزه‌دار از طریق شبکه تبلیغاتی «یکتانت» (Yektanet). جایگزین سریع و پایدار برای شبکه داخلی ایران.',
    },
    admob: {
      badge: 'Google Play AdMob SDK',
      regionBadge: 'Global Mobile Ads Network',
      accentColor: '#06d6a0',
      description:
        'پخش تبلیغ استاندارد Google Play AdMob برای کاربران بین‌المللی. در صورت عدم دسترسی در ایران، سیستم خودکار به تپسل یا یکتانت سوییچ می‌کند.',
    },
  }[overlay.provider];

  return (
    <div
      role="dialog"
      dir="rtl"
      aria-label="Regional Advertisement Overlay"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 select-none pointer-events-auto text-white"
    >
      {/* Top Ad Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold">
          <span className="bg-[#ffd166] text-black px-2 py-0.5 rounded text-[10px] font-black">
            {overlay.provider.toUpperCase()}
          </span>
          <span>{providerMeta.badge}</span>
          <span className="font-mono text-[10px] opacity-80" dir="ltr">
            ({overlay.unitId})
          </span>
          {overlay.usedFallback && (
            <span className="bg-amber-500/30 border border-amber-400 text-amber-200 px-2 py-0.5 rounded text-[10px]">
              سوییچ خودکار جایگزین (Fallback)
            </span>
          )}
        </div>

        {overlay.canClose ? (
          <button
            type="button"
            onClick={() => admob.closeActiveAd()}
            aria-label="Close Advertisement and Claim Reward"
            className="px-4 py-1.5 bg-[#06d6a0] hover:bg-[#05b586] text-[#081c15] font-black text-xs rounded-full flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>بستن و دریافت پاداش</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 bg-white/15 rounded-full text-xs font-bold tabular-nums">
            پاداش در {overlay.secondsRemaining} ثانیه...
          </div>
        )}
      </div>

      {/* Center Ad Preview Showcase */}
      <div className="my-auto max-w-md mx-auto text-center flex flex-col items-center gap-3.5 bg-[#1b4332] border-2 border-[#52b788] p-7 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#ffd166] text-[#081c15] flex items-center justify-center shadow-lg">
          <Gift className="w-9 h-9" />
        </div>
        <span className="px-3 py-1 rounded-full bg-[#0f281e] border border-[#52b788]/50 text-[#06d6a0] text-[11px] font-bold">
          {providerMeta.regionBadge} ({overlay.detectedCountry === 'IR' ? 'ایران' : 'Global'})
        </span>
        <h3 className="text-xl font-black text-[#ffd166]">
          {overlay.type === 'rewarded'
            ? `تبلیغ جایزه‌دار (${providerMeta.badge})`
            : `تبلیغ بینابینی (${providerMeta.badge})`}
        </h3>
        <p className="text-xs text-[#d8f3dc] leading-relaxed">{providerMeta.description}</p>
        <p className="text-xs text-[#ffd166] font-bold">پاداش: {overlay.rewardLabel}</p>
        {overlay.canClose && (
          <div className="text-xs font-black text-[#06d6a0] bg-[#06d6a0]/15 px-4 py-2 rounded-xl border border-[#06d6a0]/40">
            ✓ پاداش با موفقیت ثبت شد!
          </div>
        )}
      </div>

      {/* Bottom Legal Footer */}
      <div className="text-center text-[11px] text-white/50">
        Smart Geo-Ad Router · Google AdMob + Tapsell Plus (تپسل) + Yektanet (یکتانت)
      </div>
    </div>
  );
};
