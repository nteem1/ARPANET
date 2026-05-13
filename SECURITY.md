# Security Policy

## Supported Versions

The following versions of the ARPANET Interactive Research Platform currently receive security updates and maintenance.

| Version              | Supported |
| -------------------- | --------- |
| Latest / main branch | ✅         |
| Older versions       | ❌         |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### Preferred Reporting Method

Please send a detailed report including:

* Description of the vulnerability
* Steps to reproduce
* Potential impact
* Screenshots or proof-of-concept if applicable
* Suggested remediation (optional)

You can report vulnerabilities through:

* GitHub Security Advisories (preferred, if enabled)
* Private email to the project maintainer

Do **not** publicly disclose vulnerabilities until they have been reviewed and addressed.

---

## Response Timeline

The project maintainer will aim to:

* Acknowledge reports within **72 hours**
* Provide an initial assessment within **7 days**
* Release fixes as quickly as reasonably possible depending on severity

---

## Security Scope

This project is primarily a static frontend web application with optional Python/Flask-based serving support.

Security considerations include:

* Browser-side storage using `localStorage`
* Client-side JavaScript rendering
* Static asset hosting
* Optional Flask deployment environment
* Third-party Python dependencies

---

## Best Practices for Deployment

When deploying this project:

* Always serve the site over HTTPS
* Keep Python dependencies updated
* Avoid exposing debug configurations in production
* Use a production WSGI server such as `gunicorn`
* Configure proper HTTP security headers
* Restrict server access and firewall unnecessary ports
* Validate and sanitize any future user-generated content features

---

## Known Security Notes

Current project features using browser persistence:

* Poll data
* Guestbook entries
* Visitor counters
* Theme preferences

are stored locally in the browser using `localStorage`.

No sensitive authentication or financial data should be stored in the application without implementing additional backend security controls.

---

## Dependency Security

The project currently uses:

* Flask
* Gunicorn
* psutil
* speedtest-cli

Regularly review dependencies for known vulnerabilities and update them when security patches become available.

Helpful resources:

* [Flask Security Documentation](https://flask.palletsprojects.com/en/stable/web-security/?utm_source=chatgpt.com)
* [Python Packaging Advisory Database](https://pypi.org/security/?utm_source=chatgpt.com)
* [GitHub Dependabot Alerts](https://github.com/security/dependabot?utm_source=chatgpt.com)

---

## Security Headers Recommendation

For production deployments, consider enabling:

* `Content-Security-Policy`
* `X-Content-Type-Options`
* `Referrer-Policy`
* `Strict-Transport-Security`
* `Permissions-Policy`

---

## Disclosure Policy

Please practice responsible disclosure.

The maintainer requests that security issues remain private until:

1. The issue is confirmed
2. A mitigation or fix is available
3. Users have had reasonable time to update

Thank you for helping improve the security of this project.

