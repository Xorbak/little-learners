/** True once a grown-up has typed her name (the default profile name doesn't count) */
export const hasName = (name: string | undefined) => !!name && name !== 'My little one';
