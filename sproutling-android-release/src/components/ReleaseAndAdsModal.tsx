/**
 * Google Play AdMob Configuration, Live Ad Overlay Simulator, PWA Installer,
 * and Automated Git Revisioning / GitHub Subfolder & Android APK Build Manager.
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
} from 'lucide-react';
import { admob, type AdMobConfig, type ActiveAdOverlay } from '../game/admob';
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = admob.saveConfig(config);
    if (!res.valid) {
      setStatusMsg({ type: 'err', text: res.error || 'خطا در اعتبارسنجی شناسه‌ها' });
    } else {
      setStatusMsg({
        type: 'ok',
        text: 'تنظیمات AdMob ذخیره و اعتبارسنجی شد.',
      });
    }
  };

  const handleResetTest = () => {
    const def = admob.resetToTestIds();
    setConfig(def);
    setStatusMsg({
      type: 'ok',
      text: 'شناسه‌های تست رسمی گوگل بازیابی شدند (ایمن در برابر مسدودیت اکانت).',
    });
  };

  const handleTestRewardedAd = () => {
    onClose();
    admob.showRewardedAd('+3 Golden Sun-Seeds', () => {
      onGrantBonusSeeds();
    });
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
      aria-label="Google Play AdMob and APK Build Configuration"
      className="fixed inset-0 z-50 bg-[#07130c]/85 flex items-center justify-center p-3 sm:p-6 select-none pointer-events-auto"
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#1b4332] border-2 border-[#709775] rounded-3xl p-5 sm:p-6 shadow-2xl text-[#e9f5db] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d6a4f] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] border border-[#95d5b2]/50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-[#ffd166]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Android APK · GitHub Subfolder & AdMob
              </h2>
              <p className="text-[11px] text-[#95d5b2]">
                Publisher Account: <span className="font-mono text-[#ffd166]">{config.publisherEmail}</span>
                {gitStatus && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-[#0f281e] text-[#06d6a0] font-mono text-[10px]">
                    {gitStatus.versionTag} ({gitStatus.commitHash})
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
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
            ۱. تنظیمات Google AdMob
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
            {/* Policy Warning Box */}
            <div className="bg-[#0f281e] border border-[#ffd166]/50 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#ffd166] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-[#d8f3dc]">
                <strong className="text-[#ffd166]">نکته فنی و امنیتی گوگل:</strong> اتصال تبلیغات در Google Play صرفاً با ایمیل انجام نمی‌شود؛ SDK رسمی AdMob نیازمند{' '}
                <code className="text-[#ffd166]">App ID</code> و <code className="text-[#ffd166]">Ad Unit ID</code> از پنل AdMob شماست. همچنین تا پیش از انتشار نهایی در Google Play، حالت{' '}
                <strong>Test Mode</strong> را فعال نگه دارید تا اکانت شما به دلیل کلیک آزمایشی (Invalid Traffic) مسدود نشود.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                  Android Package Name (Application ID)
                </label>
                <input
                  type="text"
                  value={config.packageName}
                  onChange={(e) => setConfig({ ...config, packageName: e.target.value })}
                  className="w-full bg-[#0f281e] border border-[#40916c] rounded-lg px-2.5 py-2 text-white font-mono text-xs"
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
                  placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
                  className="w-full bg-[#0f281e] border border-[#40916c] rounded-lg px-2.5 py-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                  Rewarded Video Unit ID
                </label>
                <input
                  type="text"
                  value={config.rewardedAdUnitId}
                  onChange={(e) => setConfig({ ...config, rewardedAdUnitId: e.target.value })}
                  className="w-full bg-[#0f281e] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#95d5b2] uppercase mb-1">
                  Interstitial Unit ID
                </label>
                <input
                  type="text"
                  value={config.interstitialAdUnitId}
                  onChange={(e) => setConfig({ ...config, interstitialAdUnitId: e.target.value })}
                  className="w-full bg-[#0f281e] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
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
                  className="w-full bg-[#0f281e] border border-[#40916c] rounded-lg px-2 py-1.5 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Safe Test Mode Switch */}
            <label className="flex items-center justify-between bg-[#0f281e] p-3 rounded-xl border border-[#2d6a4f] cursor-pointer">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#06d6a0]" />
                <div>
                  <span className="font-bold text-white block">
                    حالت محافظت اکانت (Google Test Ads Mode)
                  </span>
                  <span className="text-[10px] text-[#95d5b2]">
                    در زمان توسعه فعال باشد؛ فقط هنگام بیلد نهایی AAB برای استور خاموش کنید.
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
                ذخیره و اعتبارسنجی شناسه‌ها
              </button>

              <button
                type="button"
                onClick={handleResetTest}
                className="px-3 py-2.5 bg-[#2d6a4f] hover:bg-[#40916c] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test IDs</span>
              </button>

              <button
                type="button"
                onClick={handleTestRewardedAd}
                className="px-4 py-2.5 bg-[#ffd166] hover:bg-[#ffe08a] text-[#081c15] font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تست تبلیغ جایزه‌دار (+3 بذر)</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    <p className="mt-1 font-mono text-[10px] text-[#ffd166]">
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
                  اجرای ۱۰۰٪ آفلاین بدون نیاز به اینترنت و حالت Eco برای گوشی‌های قدیمی و ضعیف.
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
                <span className="text-[11px] text-[#ffd166] font-semibold shrink-0">
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

              <pre className="bg-[#07130c] p-2.5 rounded-lg text-[10px] font-mono text-[#95d5b2] overflow-x-auto">
{`# کامیت نسخه جدید و انتشار در زیرپوشه گیت‌هاب:
bash ./${subfolder}/sync-and-publish-github.sh

# کامپایل محلی فایل‌های APK و AAB:
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
 * Interactive AdMob Overlay Simulator (Runs when testing Rewarded / Interstitial Ads in Web)
 */
export const AdMobSimulatorOverlay: React.FC = () => {
  const [overlay, setOverlay] = useState<ActiveAdOverlay | null>(null);

  useEffect(() => {
    return admob.subscribe(setOverlay);
  }, []);

  if (!overlay) return null;

  return (
    <div
      role="dialog"
      aria-label="Google AdMob Advertisement"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 select-none pointer-events-auto text-white"
    >
      {/* Top Ad Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold">
          <span className="bg-[#ffd166] text-black px-1.5 py-0.5 rounded text-[10px] font-black">
            Ad
          </span>
          <span>
            {overlay.isTest ? 'Google AdMob Test Ad' : 'Google Play Sponsored'} ·{' '}
            <span className="font-mono text-[10px] opacity-80">{overlay.unitId}</span>
          </span>
        </div>

        {overlay.canClose ? (
          <button
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
      <div className="my-auto max-w-md mx-auto text-center flex flex-col items-center gap-4 bg-[#1b4332] border-2 border-[#52b788] p-8 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#ffd166] text-[#081c15] flex items-center justify-center shadow-lg">
          <Gift className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-black text-[#ffd166]">
          {overlay.type === 'rewarded' ? 'Rewarded Video Ad' : 'Interstitial Ad'}
        </h3>
        <p className="text-xs text-[#d8f3dc] leading-relaxed">
          پخش آزمایشی استاندارد <strong>Google Play AdMob SDK</strong>. پس از پایان شمارش معکوس، جایزه{' '}
          <span className="text-[#ffd166] font-bold">({overlay.rewardLabel})</span> به صورت آنی به بازیکن اعمال می‌شود.
        </p>
        {overlay.canClose && (
          <div className="text-xs font-black text-[#06d6a0] bg-[#06d6a0]/15 px-4 py-2 rounded-xl border border-[#06d6a0]/40">
            ✓ پاداش با موفقیت ثبت شد!
          </div>
        )}
      </div>

      {/* Bottom Legal Footer */}
      <div className="text-center text-[11px] text-white/50">
        Google Mobile Ads SDK · Compliant with Google Play Families & Action Game Ad Policies
      </div>
    </div>
  );
};
