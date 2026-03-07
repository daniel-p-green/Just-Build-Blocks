import { Window } from 'happy-dom';

const windowInstance = new Window({
  url: 'http://localhost/',
});

const bindWindowMethod = <T extends (...args: never[]) => unknown>(method: T | undefined) =>
  method ? method.bind(windowInstance) : undefined;

const defineGlobal = (key: string, value: unknown) => {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
};

defineGlobal('window', windowInstance);
defineGlobal('self', windowInstance);
defineGlobal('document', windowInstance.document);
defineGlobal('navigator', windowInstance.navigator);
defineGlobal('location', windowInstance.location);
defineGlobal('history', windowInstance.history);
defineGlobal('customElements', windowInstance.customElements);
defineGlobal('HTMLElement', windowInstance.HTMLElement);
defineGlobal('HTMLButtonElement', windowInstance.HTMLButtonElement);
defineGlobal('HTMLCanvasElement', windowInstance.HTMLCanvasElement);
defineGlobal('HTMLImageElement', windowInstance.HTMLImageElement);
defineGlobal('HTMLInputElement', windowInstance.HTMLInputElement);
defineGlobal('HTMLTextAreaElement', windowInstance.HTMLTextAreaElement);
defineGlobal('HTMLIFrameElement', windowInstance.HTMLIFrameElement);
defineGlobal('SVGElement', windowInstance.SVGElement);
defineGlobal('Element', windowInstance.Element);
defineGlobal('Node', windowInstance.Node);
defineGlobal('Text', windowInstance.Text);
defineGlobal('Comment', windowInstance.Comment);
defineGlobal('Event', windowInstance.Event);
defineGlobal('CustomEvent', windowInstance.CustomEvent);
defineGlobal('MouseEvent', windowInstance.MouseEvent);
defineGlobal('KeyboardEvent', windowInstance.KeyboardEvent);
defineGlobal('FocusEvent', windowInstance.FocusEvent);
defineGlobal('MutationObserver', windowInstance.MutationObserver);
defineGlobal('DOMParser', windowInstance.DOMParser);
defineGlobal('File', windowInstance.File);
defineGlobal('FileReader', windowInstance.FileReader);
defineGlobal('Blob', windowInstance.Blob);
defineGlobal('FormData', windowInstance.FormData);
defineGlobal('Image', windowInstance.Image);
defineGlobal('URL', windowInstance.URL);
defineGlobal('URLSearchParams', URLSearchParams);
defineGlobal('localStorage', windowInstance.localStorage);
defineGlobal('sessionStorage', windowInstance.sessionStorage);
defineGlobal('performance', windowInstance.performance);
defineGlobal('getComputedStyle', bindWindowMethod(windowInstance.getComputedStyle));
defineGlobal('matchMedia', bindWindowMethod(windowInstance.matchMedia));
defineGlobal('requestAnimationFrame', bindWindowMethod(windowInstance.requestAnimationFrame));
defineGlobal('cancelAnimationFrame', bindWindowMethod(windowInstance.cancelAnimationFrame));
