import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import approved from './content/approved.json';
import siteData from './generated/site-data.json';
import './styles.css';

function useRevealAnimations() {
  useEffect(() => {
    const revealNodes = [...document.querySelectorAll('[data-reveal]')];
    if (!revealNodes.length) return undefined;

    if (!('IntersectionObserver' in window)) {
      revealNodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function ArrowIcon() {
  return <span aria-hidden="true" className="arrow-icon">↗</span>;
}

function SectionLabel({ number, children }) {
  return (
    <p className="section-label">
      <span>{number}</span>
      {children}
    </p>
  );
}

function formatSourceDate(value) {
  return value ? String(value).replaceAll('-', '.') : '기준일 확인 필요';
}

function EvidenceFigure({ label, value, detail, source, featured = false }) {
  return (
    <article className={`evidence-figure ${featured ? 'evidence-figure-featured' : ''}`} data-reveal>
      <div className="evidence-figure-topline">
        <span>{label}</span>
        <span>근거</span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
      <small>출처 · {source}</small>
    </article>
  );
}

function App() {
  useRevealAnimations();
  const metrics = Object.fromEntries(siteData.metrics.map((metric) => [metric.id, metric]));
  const contactHref = approved.contact.isPlaceholder ? '#contact-review' : `mailto:${approved.contact.email}`;
  const recoveryMetric = metrics['ritual-successes'];
  const persistenceMetric = metrics['ritual-open-days'];
  const absenceMetric = metrics['attendance-absence'];
  const attendanceMetric = metrics['attendance-confirmed'];
  const submissionMetric = metrics['submission-rate'];
  const attendanceAsOf = formatSourceDate(attendanceMetric?.asOf ?? absenceMetric?.asOf);
  const submissionAsOf = formatSourceDate(submissionMetric?.asOf);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="김태빈 프로필 첫 화면으로 이동">
          <span className="wordmark-symbol">TB</span>
          <span>김태빈 / profile 2026</span>
        </a>
        <nav className="topnav" aria-label="페이지 이동">
          <a href="#story">이야기</a>
          <a href="#strengths">능력</a>
          <a href="#proof">근거</a>
          <a href="#works">대표작</a>
        </nav>
        <a className="top-contact" href={contactHref}>{approved.contact.label} <ArrowIcon /></a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-inner page-width">
            <div className="hero-copy">
              <p className="hero-overline">지원용 자기소개 / 웹 애플리케이션 · 정보보안</p>
              <h1 id="hero-title">
                <span className="hero-name">{approved.name}</span>
                <span className="hero-lead">{approved.heroLead.split('\n').map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</span>
              </h1>
              <p className="hero-tagline">{approved.tagline}</p>
              <p className="hero-intro">{approved.intro}</p>
              <div className="hero-actions">
                <a className="primary-button" href="#story">이야기부터 읽기 <ArrowIcon /></a>
                <a className="quiet-link" href="#works">대표작 보기 <ArrowIcon /></a>
              </div>
            </div>

            <aside className="hero-method" aria-label="김태빈이 일하는 방식">
              <div className="method-topline">
                <span>나의 일하는 방식</span>
                <span>2022—2026</span>
              </div>
              <div className="method-copy">
                <p>혼자 멈추던 장면을</p>
                <strong>함께<br />해결하는<br />방식으로</strong>
              </div>
              <ol className="method-steps">
                {approved.methodSteps.map((step, index) => (
                  <li key={step.label}>
                    <span>0{index + 1}</span>
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                  </li>
                ))}
              </ol>
              <p className="method-note">모르는 것을 넘기지 않고, 확인한 것을 다시 나눕니다.</p>
            </aside>
          </div>
        </section>

        <section id="story" className="story-section page-width" aria-labelledby="story-title">
          <div className="section-head story-head">
            <div>
              <SectionLabel number="01">나의 이야기</SectionLabel>
              <h2 id="story-title">{approved.storyLead}</h2>
            </div>
            <div className="section-note">
              <span className="note-mark">01—03</span>
              <p>{approved.storyAside}</p>
            </div>
          </div>

          <div className="story-flow">
            {approved.story.map((chapter, index) => (
              <article className="story-scene" key={`${chapter.date}-${chapter.label}`} data-reveal>
                <div className="scene-marker">
                  <span>0{index + 1}</span>
                  <i aria-hidden="true" />
                </div>
                <div className="scene-meta">
                  <strong>{chapter.date}</strong>
                  <span>{chapter.period}</span>
                  <em>{chapter.label}</em>
                </div>
                <div className="scene-content">
                  <div className="scene-heading">
                    <h3>{chapter.ability}</h3>
                    <p>{chapter.abilityShort}</p>
                  </div>
                  <div className="scene-copy">
                    <p>{chapter.text}</p>
                    <p className="scene-proof"><span>이 장면에서 남은 것</span>{chapter.proof}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="strengths" className="strengths-section" aria-labelledby="strengths-title">
          <div className="page-width">
            <div className="section-head section-head-dark">
              <div>
                <SectionLabel number="02">세 능력이 자란 방식</SectionLabel>
                <h2 id="strengths-title">그때의 어려움이<br />지금의 방식이 되었습니다.</h2>
              </div>
              <p>이야기 속 장면을 다시 반복하지 않고, 행동의 변화를 세 단계로 정리했습니다.</p>
            </div>
            <div className="ability-map">
              {approved.strengths.map((strength, index) => (
                <article className="ability-card" key={strength.name} data-reveal>
                  <div className="ability-card-header">
                    <span>0{index + 1}</span>
                    <span>{strength.keyword}</span>
                  </div>
                  <h3>{strength.name}</h3>
                  <div className="ability-path">
                    <div><span>그때</span><p>{strength.before}</p></div>
                    <div><span>바꾼 행동</span><p>{strength.action}</p></div>
                    <div><span>지금</span><p>{strength.now}</p></div>
                  </div>
                  <small>{strength.source}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className="proof-section page-width" aria-labelledby="proof-title">
          <div className="section-head proof-head">
            <div>
              <SectionLabel number="03">기록은 근거로만</SectionLabel>
              <h2 id="proof-title">이야기 뒤에 놓은<br />작은 확인표</h2>
            </div>
            <p>숫자는 주인공이 아니라, 바꾼 행동이 이어졌다는 사실을 확인하는 근거입니다.</p>
          </div>

          <div className="proof-layout">
            <div className="proof-lead" data-reveal>
              <span className="proof-kicker">회복탄력성 · 과제지속력</span>
              <h3>다시 움직인 날과<br />계속 기록한 날</h3>
              <p>2022년의 고비에서 시작한 변화가 현재에도 이어지는지, 같은 기록 안에서 확인했습니다.</p>
            </div>
            <div className="evidence-figures">
              <EvidenceFigure
                label="회복탄력성"
                value={recoveryMetric?.displayValue ?? '—'}
                detail="실천했다고 남긴 날"
                source="리추얼 기록 · close"
                featured
              />
              <EvidenceFigure
                label="과제지속력"
                value={persistenceMetric?.displayValue ?? '—'}
                detail="기록을 연 날"
                source="리추얼 기록 · days[].open"
              />
            </div>
          </div>

          <div className="proof-support" data-reveal>
            <div><span>내 출석 기록 · 기준일 {attendanceAsOf}</span><strong>{absenceMetric?.displayValue ?? '—'}</strong><small>결석</small></div>
            <div><span>내 출석 기록 · 기준일 {attendanceAsOf}</span><strong>{attendanceMetric?.displayValue ?? '—'}</strong><small>{attendanceMetric?.detail ?? '확정 출석'}</small></div>
            <div><span>내 제출 현황 · 기준일 {submissionAsOf}</span><strong>{submissionMetric?.displayValue ?? '—'}</strong><small>{submissionMetric?.detail ?? '제출 현황 원자료 확인 필요'}</small></div>
          </div>
        </section>

        <section id="works" className="works-section" aria-labelledby="works-title">
          <div className="page-width">
            <div className="section-head">
              <div>
                <SectionLabel number="04">대표작과 지원 문서</SectionLabel>
                <h2 id="works-title">지금 할 수 있는 일과<br />다음에 만들 일</h2>
              </div>
              <p>완성한 결과는 열어 두고, 아직 시작하지 않은 일은 빈자리로 정확하게 남겼습니다.</p>
            </div>

            <div className="works-grid">
              {approved.works.map((work, index) => (
                <article className={`work-card ${work.href ? 'work-card-paper' : 'work-card-next'}`} key={work.number} data-reveal>
                  <div className="work-card-top"><span>0{index + 1} / work {work.number}</span><span>{work.status}</span></div>
                  <div className="work-card-body">
                    <span className="work-type">{work.type}</span>
                    <h3>{work.title}</h3>
                    <p>{work.description}</p>
                    <p className="work-meta">{work.meta}</p>
                  </div>
                  {work.href ? <a className="secondary-button" href={work.href} target="_blank" rel="noreferrer">{work.linkLabel} <ArrowIcon /></a> : <span className="next-label">{work.linkLabel} <span aria-hidden="true">＋</span></span>}
                </article>
              ))}
            </div>

            <div id="documents" className="documents-panel" data-reveal>
              <div>
                <SectionLabel number="05">지원 문서</SectionLabel>
                <h3>이력서·자기소개서·경력기술서를<br />한 파일로 정리했습니다.</h3>
              </div>
              <div className="documents-action">
                <p>{approved.documents[0].description}</p>
                <a className="primary-button" href={approved.documents[0].href}>{approved.documents[0].label} 다운로드 <ArrowIcon /></a>
                <div className="device-note">
                  <span>계속 새로 쓰는 장치</span>
                  <div>{approved.deviceSteps.map((step, index) => <React.Fragment key={step}><b>{String(index + 1).padStart(2, '0')}</b><em>{step}</em>{index < approved.deviceSteps.length - 1 ? <i aria-hidden="true">→</i> : null}</React.Fragment>)}</div>
                </div>
                {approved.contact.isPlaceholder ? <span className="contact-note" id="contact-review">공개용 이메일은 최종 확인 후 연결합니다.</span> : <a className="quiet-link" href={contactHref}>{approved.contact.email} <ArrowIcon /></a>}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <span>{approved.name} / {approved.role}</span>
        <span>{approved.footerNote}</span>
      </footer>
    </div>
  );
}

const rootElement = document.getElementById('root');
const appRoot = window.__taebinProfileRoot ?? createRoot(rootElement);
window.__taebinProfileRoot = appRoot;
appRoot.render(<App />);
