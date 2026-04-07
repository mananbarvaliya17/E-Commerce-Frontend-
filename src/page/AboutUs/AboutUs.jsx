import React from 'react'
import './AboutUs.css'

const AboutUs = () => {
    const statBlocks = [
        { value: 'MERN', label: 'Stack expertise' },
        { value: 'UI/UX', label: 'Design and prototyping' },
        { value: 'Full', label: 'Stack capability' },
        { value: 'Open', label: 'to opportunities' },
    ]

    const skillGroups = [
        {
            category: 'Frontend',
            tags: ['React.js', 'JavaScript', 'Tailwind CSS', 'Bootstrap', 'HTML / CSS'],
            accent: ['React.js', 'JavaScript']
        },
        {
            category: 'Backend',
            tags: ['Node.js', 'Express.js', 'REST APIs', 'MongoDB'],
            accent: ['Node.js', 'Express.js']
        },
        {
            category: 'Design',
            tags: ['Figma', 'Photoshop', 'Illustrator', 'UI/UX Design'],
            accent: ['Figma']
        },
        {
            category: 'Tools and Workflow',
            tags: ['Git', 'GitHub', 'VS Code', 'Postman'],
            accent: []
        }
    ]

    return (
        <div className="aboutModern">
            <div className="aboutModern__wrapper">
                <section className="aboutModern__heroRow">
                    <div className="aboutModern__avatarRing" aria-hidden="true">MB</div>
                    <div className="aboutModern__heroText">
                        <h1>Manan Barvaliya</h1>
                        <p className="aboutModern__role">
                            Full Stack Developer (MERN) and UI/UX Designer building fast & 
                            user-centred web applications.
                        </p>
                        <div className="aboutModern__linksRow">
                            <a
                                className="aboutModern__linkPill aboutModern__linkPill--linkedin"
                                href="https://www.linkedin.com/in/manan-barvaliya-088412340"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                    <rect width="24" height="24" rx="4" fill="currentColor" opacity=".15" />
                                    <path d="M7 10v8M7 7v.01M12 18v-5a2 2 0 014 0v5m-4-5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                className="aboutModern__linkPill aboutModern__linkPill--github"
                                href="https://github.com/mananbarvaliya17"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                                GitHub
                            </a>
                        </div>
                    </div>
                </section>

                <p className="aboutModern__sectionLabel">At A Glance</p>
                <section className="aboutModern__statRow">
                    {statBlocks.map((item) => (
                        <article className="aboutModern__statBox" key={item.label}>
                            <div className="aboutModern__sv">{item.value}</div>
                            <div className="aboutModern__sl">{item.label}</div>
                        </article>
                    ))}
                </section>

                <p className="aboutModern__sectionLabel">About Me</p>
                <section className="aboutModern__bioCard">
                    Hi, I&apos;m <strong>Manan Barvaliya</strong> : Detail-oriented MERN Stack Developer with hands-on experience building responsive and scalable web applications using MongoDB, Express.js, React.js, and Node.js. Skilled in developing user-focused interfaces and integrating frontend with backend services. Passionate about writing clean, maintainable code and continuously learning modern web technologies.
                </section>

                <p className="aboutModern__sectionLabel">Skills And Tools</p>
                <section className="aboutModern__skillsGrid">
                    {skillGroups.map((group) => (
                        <article className="aboutModern__skillCard" key={group.category}>
                            <span className="aboutModern__skCategory">{group.category}</span>
                            <div className="aboutModern__skTags">
                                {group.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className={`aboutModern__tag${group.accent.includes(tag) ? ' aboutModern__tag--accent' : ''}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </article>
                    ))}
                </section>

                <hr className="aboutModern__divider" />

                <section className="aboutModern__ctaBar">
                    <a
                        className="aboutModern__ctaBtn aboutModern__ctaBtn--primary aboutModern__ctaBtn--linkedin"
                        href="https://www.linkedin.com/in/manan-barvaliya-088412340"
                        target="_blank"
                        rel="noreferrer"
                    >
                        View LinkedIn
                    </a>
                    <a
                        className="aboutModern__ctaBtn aboutModern__ctaBtn--github"
                        href="https://github.com/mananbarvaliya17"
                        target="_blank"
                        rel="noreferrer"
                    >
                        View GitHub
                    </a>
                </section>
            </div>
        </div>
    )
}

export default AboutUs