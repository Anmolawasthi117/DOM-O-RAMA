import { type FC, createElement } from 'react';
import type { VNode } from '../core/engine/VDOMSimulator';

interface VNodeRendererProps {
  node: VNode;
  onEvent?: (tag: string, props: any) => void;
}

export const VNodeRenderer: FC<VNodeRendererProps> = ({ node, onEvent }) => {
  const { tag, props = {}, children = [] } = node;

  if (tag === 'text') {
    return props.text || (node as any).text || '';
  }

  const handleEvent = (e: any) => {
    // Intercept clicks to trigger playground simulation
    if (onEvent) {
      // Prevent default form submission
      if (tag === 'form' || (tag === 'button' && props.type === 'submit')) {
        e.preventDefault();
      }
      onEvent(tag, props);
    }
  };

  const interactiveProps: any = { ...props };
  
  if (tag === 'form') {
    interactiveProps.onSubmit = (e: any) => {
      e.preventDefault();
      if (onEvent) onEvent(tag, props);
    };
  }

  // Add click handler to interactive elements
  if (['button', 'input', 'a', 'form'].includes(tag) || props.onClick) {
    interactiveProps.onClick = (e: any) => {
      // Prevent default for links, forms, and submit buttons (explicit or default)
      if (
        tag === 'a' || 
        tag === 'form' || 
        (tag === 'button' && (!props.type || props.type === 'submit'))
      ) {
        e.preventDefault();
      }
      
      handleEvent(e);
      props.onClick?.(e);
    };
  }

  // Handle styles string to object if needed (simplified)
  if (typeof interactiveProps.style === 'string') {
    // skip parsing for now, user scenarios shouldn't use string styles yet
  }

  const isVoid = ['input', 'br', 'hr', 'img', 'meta', 'link'].includes(tag);

  return createElement(
    tag,
    interactiveProps,
    isVoid ? undefined : children.map((child, i) => (
      <VNodeRenderer key={i} node={child} onEvent={onEvent} />
    ))
  );
};
