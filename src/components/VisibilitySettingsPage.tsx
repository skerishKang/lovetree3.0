import {
  VISIBILITY_OPTIONS,
  ADDITIONAL_SETTINGS,
  SHARE_LINK_PLACEHOLDER,
} from "../data/visibilitySettingsMockData";
import styles from "./VisibilitySettingsPage.module.css";

export default function VisibilitySettingsPage() {
  return (
    <div className={styles.page}>
      {/* 화면 제목 */}
      <header className={styles.topBar}>
        <h1 className={styles.screenTitle}>공개 범위 설정</h1>
      </header>

      <main className={styles.content}>
        {/* 공개 범위 선택 */}
        <fieldset className={styles.visibilityFieldset}>
          <legend className={styles.fieldsetLegend}>공개 범위</legend>
          <div className={styles.radioGroup} role="radiogroup" aria-label="공개 범위">
            {VISIBILITY_OPTIONS.map((opt, idx) => (
              <label key={opt.id} className={styles.optionCard}>
                <input
                  type="radio"
                  name="visibility"
                  className={styles.visRadio}
                  defaultChecked={idx === 0}
                />
                <div className={styles.optionIcon} aria-hidden="true">
                  {opt.iconType === "private" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#3d3229" strokeWidth="1.5"/>
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#3d3229" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {opt.iconType === "link" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#3d3229" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#3d3229" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {opt.iconType === "community" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#3d3229" strokeWidth="1.5"/>
                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#3d3229" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M17 7l-2 2m0 0l-2-2m2 2V3" stroke="#3d3229" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className={styles.optionBody}>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  <span className={styles.optionDesc}>{opt.description}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 공유 링크 표시 */}
        <section className={styles.shareLinkSection} aria-label="공유 링크">
          <h2 className={styles.sectionLabel}>공유 링크</h2>
          <div className={styles.linkDisplay}>
            <input
              type="text"
              className={styles.linkInput}
              value={SHARE_LINK_PLACEHOLDER}
              aria-label="공유 링크 주소"
              readOnly
            />
            <button type="button" className={styles.copyButton} aria-label="링크 복사">
              링크 복사
            </button>
          </div>
        </section>

        {/* 추가 설정 */}
        <fieldset className={styles.settingsFieldset}>
          <legend className={styles.fieldsetLegend}>추가 설정</legend>
          <div className={styles.checkboxGroup}>
            {ADDITIONAL_SETTINGS.map((setting) => (
              <label key={setting.id} className={styles.settingRow}>
                <input
                  type="checkbox"
                  className={styles.settingCheckbox}
                  defaultChecked={setting.defaultChecked}
                />
                <div className={styles.settingBody}>
                  <span className={styles.settingLabel}>{setting.label}</span>
                  <span className={styles.settingDesc}>{setting.description}</span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 저장 버튼 */}
        <div className={styles.actions}>
          <button type="button" className={styles.saveButton} aria-label="공개 범위 저장">
            저장
          </button>
        </div>
      </main>
    </div>
  );
}
