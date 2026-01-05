import type { VNode } from '../core/engine/VDOMSimulator';

export interface Scenario {
    id: string;
    name: string;
    description: string;
    initialTree: VNode;
    finalTree: VNode; // For simple diffs
    actionLabel: string; // e.g., "Submit Form"
}

export const scenarios: Scenario[] = [
    {
        id: 'form-submit',
        name: 'Form Submission',
        description: 'Simulate a user filling out a login form and clicking submit. Watch how the validation error appears.',
        actionLabel: 'Submit Login',
        initialTree: {
            tag: 'div',
            props: { className: 'login-form p-4 border rounded shadow-sm' },
            children: [
                { tag: 'h2', children: [{ tag: 'text', text: 'Login' }] },
                {
                    tag: 'input',
                    props: { type: 'email', placeholder: 'user@example.com', className: 'block w-full mb-2 p-2 border' }
                },
                {
                    tag: 'input',
                    props: { type: 'password', placeholder: '••••••', className: 'block w-full mb-4 p-2 border' }
                },
                {
                    tag: 'button',
                    props: { className: 'bg-blue-500 text-white px-4 py-2 rounded' },
                    children: [{ tag: 'text', text: 'Log In' }]
                }
            ]
        },
        finalTree: {
            tag: 'div',
            props: { className: 'login-form p-4 border rounded shadow-sm' },
            children: [
                { tag: 'h2', children: [{ tag: 'text', text: 'Login' }] },
                {
                    tag: 'input',
                    props: { type: 'email', placeholder: 'user@example.com', className: 'block w-full mb-2 p-2 border border-red-500' }
                },
                {
                    tag: 'input',
                    props: { type: 'password', placeholder: '••••••', className: 'block w-full mb-4 p-2 border border-red-500' }
                },
                {
                    tag: 'div',
                    props: { className: 'text-red-500 text-sm mb-2 font-bold animate-pulse' },
                    children: [{ tag: 'text', text: '⚠ Invalid credentials' }]
                },
                {
                    tag: 'button',
                    props: { className: 'bg-blue-500 text-white px-4 py-2 rounded opacity-50 cursor-wait' },
                    children: [{ tag: 'text', text: 'Logging in...' }]
                }
            ]
        }
    },
    {
        id: 'like-button',
        name: 'Like Button',
        description: 'A simple counter update when clicking a like button.',
        actionLabel: 'Click Like',
        initialTree: {
            tag: 'button',
            props: { className: 'like-btn flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50' },
            children: [
                { tag: 'span', children: [{ tag: 'text', text: '♥' }] },
                { tag: 'text', text: 'Like (0)' }
            ]
        },
        finalTree: {
            tag: 'button',
            props: { className: 'like-btn flex items-center gap-2 px-4 py-2 border rounded bg-pink-50 border-pink-200 text-pink-600' },
            children: [
                { tag: 'span', children: [{ tag: 'text', text: '♥' }] },
                { tag: 'text', text: 'Like (1)' }
            ]
        }
    }
];
