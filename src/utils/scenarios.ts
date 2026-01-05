import type { VNode } from '../core/engine/VDOMSimulator';

export interface Scenario {
    id: string;
    name: string;
    description: string;
    initialTree: VNode;
    finalTree: VNode;
    actionLabel: string;
    icon: string;
}

export const scenarios: Scenario[] = [
    {
        id: 'form-submit',
        name: 'Form Submission',
        description: 'Submit a login form and watch validation errors appear.',
        actionLabel: 'Submit Login',
        icon: '📝',
        initialTree: {
            tag: 'div',
            props: { className: 'login-form p-4 border rounded shadow-sm' },
            children: [
                { tag: 'h2', children: [{ tag: 'text', text: 'Login' }] },
                { tag: 'input', props: { type: 'email', placeholder: 'user@example.com', className: 'block w-full mb-2 p-2 border' } },
                { tag: 'input', props: { type: 'password', placeholder: '••••••', className: 'block w-full mb-4 p-2 border' } },
                { tag: 'button', props: { className: 'bg-blue-500 text-white px-4 py-2 rounded' }, children: [{ tag: 'text', text: 'Log In' }] }
            ]
        },
        finalTree: {
            tag: 'div',
            props: { className: 'login-form p-4 border rounded shadow-sm' },
            children: [
                { tag: 'h2', children: [{ tag: 'text', text: 'Login' }] },
                { tag: 'input', props: { type: 'email', placeholder: 'user@example.com', className: 'block w-full mb-2 p-2 border border-red-500' } },
                { tag: 'input', props: { type: 'password', placeholder: '••••••', className: 'block w-full mb-4 p-2 border border-red-500' } },
                { tag: 'div', props: { className: 'text-red-500 text-sm mb-2 font-bold' }, children: [{ tag: 'text', text: '⚠ Invalid credentials' }] },
                { tag: 'button', props: { className: 'bg-blue-500 text-white px-4 py-2 rounded opacity-50' }, children: [{ tag: 'text', text: 'Logging in...' }] }
            ]
        }
    },
    {
        id: 'like-button',
        name: 'Like Button',
        description: 'Click a like button and watch the counter update.',
        actionLabel: 'Click Like',
        icon: '❤️',
        initialTree: {
            tag: 'button',
            props: { className: 'like-btn flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50' },
            children: [
                { tag: 'span', children: [{ tag: 'text', text: '♥' }] },
                { tag: 'span', children: [{ tag: 'text', text: 'Like (0)' }] }
            ]
        },
        finalTree: {
            tag: 'button',
            props: { className: 'like-btn flex items-center gap-2 px-4 py-2 border rounded bg-pink-50 border-pink-200 text-pink-600' },
            children: [
                { tag: 'span', children: [{ tag: 'text', text: '♥' }] },
                { tag: 'span', children: [{ tag: 'text', text: 'Like (1)' }] }
            ]
        }
    },
    {
        id: 'todo-add',
        name: 'Add Todo Item',
        description: 'Add a new item to a todo list.',
        actionLabel: 'Add Item',
        icon: '✅',
        initialTree: {
            tag: 'div',
            props: { className: 'todo-list p-4' },
            children: [
                { tag: 'h3', children: [{ tag: 'text', text: 'My Todos' }] },
                {
                    tag: 'ul', props: { className: 'list-disc pl-5' }, children: [
                        { tag: 'li', children: [{ tag: 'text', text: 'Learn React' }] },
                        { tag: 'li', children: [{ tag: 'text', text: 'Build a project' }] }
                    ]
                },
                { tag: 'button', props: { className: 'mt-2 px-3 py-1 bg-green-500 text-white rounded' }, children: [{ tag: 'text', text: '+ Add' }] }
            ]
        },
        finalTree: {
            tag: 'div',
            props: { className: 'todo-list p-4' },
            children: [
                { tag: 'h3', children: [{ tag: 'text', text: 'My Todos' }] },
                {
                    tag: 'ul', props: { className: 'list-disc pl-5' }, children: [
                        { tag: 'li', children: [{ tag: 'text', text: 'Learn React' }] },
                        { tag: 'li', children: [{ tag: 'text', text: 'Build a project' }] },
                        { tag: 'li', props: { className: 'text-green-600 font-bold' }, children: [{ tag: 'text', text: 'New task added!' }] }
                    ]
                },
                { tag: 'button', props: { className: 'mt-2 px-3 py-1 bg-green-500 text-white rounded' }, children: [{ tag: 'text', text: '+ Add' }] }
            ]
        }
    },
    {
        id: 'modal-open',
        name: 'Modal Toggle',
        description: 'Open a modal dialog overlay.',
        actionLabel: 'Open Modal',
        icon: '📦',
        initialTree: {
            tag: 'div',
            props: { className: 'modal-demo' },
            children: [
                { tag: 'button', props: { className: 'px-4 py-2 bg-purple-500 text-white rounded' }, children: [{ tag: 'text', text: 'Open Modal' }] }
            ]
        },
        finalTree: {
            tag: 'div',
            props: { className: 'modal-demo' },
            children: [
                { tag: 'button', props: { className: 'px-4 py-2 bg-purple-500 text-white rounded' }, children: [{ tag: 'text', text: 'Open Modal' }] },
                {
                    tag: 'div', props: { className: 'fixed inset-0 bg-black/50 flex items-center justify-center' }, children: [
                        {
                            tag: 'div', props: { className: 'bg-white p-6 rounded-xl shadow-2xl' }, children: [
                                { tag: 'h4', props: { className: 'text-lg font-bold mb-2' }, children: [{ tag: 'text', text: 'Modal Title' }] },
                                { tag: 'p', props: { className: 'text-gray-600 mb-4' }, children: [{ tag: 'text', text: 'This is a modal dialog.' }] },
                                { tag: 'button', props: { className: 'px-4 py-2 bg-gray-200 rounded' }, children: [{ tag: 'text', text: 'Close' }] }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        id: 'list-filter',
        name: 'Filter List',
        description: 'Filter a list of items to show only active ones.',
        actionLabel: 'Apply Filter',
        icon: '🔍',
        initialTree: {
            tag: 'div',
            props: { className: 'filter-list p-4' },
            children: [
                { tag: 'h3', children: [{ tag: 'text', text: 'Users' }] },
                {
                    tag: 'div', props: { className: 'space-y-2' }, children: [
                        { tag: 'div', props: { className: 'p-2 bg-gray-100 rounded' }, children: [{ tag: 'text', text: 'Alice (active)' }] },
                        { tag: 'div', props: { className: 'p-2 bg-gray-100 rounded' }, children: [{ tag: 'text', text: 'Bob (inactive)' }] },
                        { tag: 'div', props: { className: 'p-2 bg-gray-100 rounded' }, children: [{ tag: 'text', text: 'Carol (active)' }] },
                        { tag: 'div', props: { className: 'p-2 bg-gray-100 rounded' }, children: [{ tag: 'text', text: 'Dave (inactive)' }] }
                    ]
                },
                { tag: 'button', props: { className: 'mt-3 px-3 py-1 bg-blue-500 text-white rounded' }, children: [{ tag: 'text', text: 'Show Active Only' }] }
            ]
        },
        finalTree: {
            tag: 'div',
            props: { className: 'filter-list p-4' },
            children: [
                { tag: 'h3', children: [{ tag: 'text', text: 'Users (Filtered)' }] },
                {
                    tag: 'div', props: { className: 'space-y-2' }, children: [
                        { tag: 'div', props: { className: 'p-2 bg-green-100 rounded border border-green-300' }, children: [{ tag: 'text', text: 'Alice (active)' }] },
                        { tag: 'div', props: { className: 'p-2 bg-green-100 rounded border border-green-300' }, children: [{ tag: 'text', text: 'Carol (active)' }] }
                    ]
                },
                { tag: 'button', props: { className: 'mt-3 px-3 py-1 bg-gray-500 text-white rounded' }, children: [{ tag: 'text', text: 'Show All' }] }
            ]
        }
    },
    {
        id: 'accordion',
        name: 'Accordion Toggle',
        description: 'Expand an accordion section to reveal content.',
        actionLabel: 'Expand Section',
        icon: '📂',
        initialTree: {
            tag: 'div',
            props: { className: 'accordion border rounded' },
            children: [
                {
                    tag: 'div', props: { className: 'p-3 bg-gray-100 cursor-pointer flex justify-between' }, children: [
                        { tag: 'span', children: [{ tag: 'text', text: 'FAQ: What is VDOM?' }] },
                        { tag: 'span', children: [{ tag: 'text', text: '▶' }] }
                    ]
                }
            ]
        },
        finalTree: {
            tag: 'div',
            props: { className: 'accordion border rounded' },
            children: [
                {
                    tag: 'div', props: { className: 'p-3 bg-gray-100 cursor-pointer flex justify-between' }, children: [
                        { tag: 'span', children: [{ tag: 'text', text: 'FAQ: What is VDOM?' }] },
                        { tag: 'span', children: [{ tag: 'text', text: '▼' }] }
                    ]
                },
                {
                    tag: 'div', props: { className: 'p-4 bg-white border-t' }, children: [
                        { tag: 'p', children: [{ tag: 'text', text: 'The Virtual DOM is a lightweight JavaScript representation of the real DOM that enables efficient updates.' }] }
                    ]
                }
            ]
        }
    }
];
