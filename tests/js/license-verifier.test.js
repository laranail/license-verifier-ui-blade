import { readFileSync } from 'node:fs';

import { Window } from 'happy-dom';
import { describe, expect, it, vi } from 'vitest';

/** Read a theme's shipped script stub (tokens live only in comments → valid JS). */
function script(theme) {
    return readFileSync(`stubs/themes/${theme}/js/license-verifier.js.stub`, 'utf8');
}

/** Build an isolated happy-dom window, mock fetch, and eval the script into it. */
function boot(theme, bodyHtml = '') {
    const window = new Window({ url: 'http://localhost/' });
    window.document.head.innerHTML = '<meta name="csrf-token" content="tok">';
    window.document.body.innerHTML = bodyHtml;

    const fetchMock = vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'OK' }) }));
    window.fetch = fetchMock;
    window.eval(script(theme));

    return { window, fetchMock };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

// The IIFE themes share a contract: delegate-submit [data-lv-form] via fetch.
describe.each(['tailwind', 'bootstrap', 'unstyled', 'custom'])('license-verifier.js (%s)', (theme) => {
    it('intercepts [data-lv-form] submit and POSTs via fetch with the CSRF token', async () => {
        const { window, fetchMock } = boot(
            theme,
            '<form data-lv-form action="/license/activate" method="post">'
            + '<input name="license_key" value="DEV-KEY"><span data-lv-message></span>'
            + '<button type="submit">go</button></form>',
        );

        window.document.querySelector('[data-lv-form]')
            .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await tick();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('/license/activate');
        expect(options.method).toBe('POST');
        expect(options.headers['X-CSRF-TOKEN']).toBe('tok');
    });

    it('navigates to data-lv-redirect after a successful activation', async () => {
        const { window } = boot(
            theme,
            '<form data-lv-form action="/license/activate" data-lv-redirect="/dashboard">'
            + '<span data-lv-message></span><button type="submit">go</button></form>',
        );

        window.document.querySelector('[data-lv-form]')
            .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await tick();

        expect(window.location.href).toBe('http://localhost/dashboard');
    });

    it('does not hijack submits outside [data-lv-form]', async () => {
        const { window, fetchMock } = boot(theme, '<form id="other" action="/x"><button type="submit">go</button></form>');

        window.document.querySelector('#other')
            .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
        await tick();

        expect(fetchMock).not.toHaveBeenCalled();
    });
});

// The Alpine theme registers a component instead of binding listeners directly.
describe('license-verifier.js (alpine)', () => {
    function bootAlpine(bodyHtml = '') {
        const window = new Window({ url: 'http://localhost/' });
        window.document.head.innerHTML = '<meta name="csrf-token" content="tok">';
        window.document.body.innerHTML = bodyHtml;

        const dataSpy = vi.fn();
        window.Alpine = { data: dataSpy };
        window.eval(script('alpine'));
        window.document.dispatchEvent(new window.Event('alpine:init'));

        return { window, factory: dataSpy.mock.calls[0]?.[1], dataSpy };
    }

    it('registers the lvLicenseForm component on alpine:init', () => {
        const { dataSpy } = bootAlpine();

        expect(dataSpy).toHaveBeenCalledWith('lvLicenseForm', expect.any(Function));
    });

    it('activate() POSTs with the CSRF token and navigates when data-lv-redirect is set', async () => {
        const { window, factory } = bootAlpine('<form action="/license/activate" data-lv-redirect="/dashboard"></form>');
        window.fetch = vi.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'OK' }) }));

        const component = factory();
        component.$el = window.document.querySelector('form');
        await component.activate();

        expect(window.fetch).toHaveBeenCalledTimes(1);
        expect(window.fetch.mock.calls[0][1].headers['X-CSRF-TOKEN']).toBe('tok');
        expect(component.ok).toBe(true);
        expect(window.location.href).toBe('http://localhost/dashboard');
    });
});
