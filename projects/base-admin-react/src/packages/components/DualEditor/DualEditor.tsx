import '@remirror/styles/all.css';

import {css} from '@emotion/css';
import {createContextState} from 'create-context-state';
import React from 'react';
import jsx from 'refractor/lang/jsx.js';
import typescript from 'refractor/lang/typescript.js';
import {ExtensionPriority, getThemeVar} from 'remirror';
import {BlockquoteExtension, BoldExtension, BulletListExtension, CodeBlockExtension, CodeExtension, HardBreakExtension, HeadingExtension, ItalicExtension, LinkExtension, ListItemExtension, MarkdownExtension, OrderedListExtension, StrikeExtension, TableExtension, TrailingNodeExtension,} from 'remirror/extensions';
import {ReactExtensions, Remirror, ThemeProvider, useRemirror, UseRemirrorReturn,} from '@remirror/react';
import {MarkdownToolbar} from '@remirror/react-ui';
import {useModelState} from "../../uses/useModelState";

/*上下文类型*/
interface Context extends Props {}

/*上下文中的props类型*/
interface Props {visual: UseRemirrorReturn<ReactExtensions<ReturnType<typeof extensions>[number]>>;}

/*创建一个上下文状态*/
const [DualEditorProvider, useDualEditor] = createContextState<Context, Props>(({ props }) => props);

const VisualEditor = (props: { onChange?: (markdownText: string) => void }) => {
  const { visual } = useDualEditor();

  return (
    <Remirror
      autoFocus
      manager={visual.manager}
      autoRender="end"
      onChange={({ helpers, state }) => {
        const markdownText = helpers.getMarkdown(state);
        props.onChange?.(markdownText);
      }}
      initialContent={visual.state}
      classNames={VisualEditorClassNames}
    >
      <MarkdownToolbar/>
    </Remirror>
  );
};


export const DualEditor: React.FC<iDualEditorProps> = (props) => {

  const [modelValue, setModelValue] = useModelState(props.value, props.onChange, {
    onPropsValueChange: (newPropsValue) => {
      // console.log('setContent', Date.now());
      visual.getContext()?.setContent(newPropsValue ?? '');
    }
  });

  const visual = useRemirror({ extensions, stringHandler: 'markdown', content: modelValue ?? basicContent, });

  return (
    <DualEditorProvider visual={visual}>
      <ThemeProvider>
        <VisualEditor onChange={setModelValue}/>
      </ThemeProvider>
    </DualEditorProvider>
  );
};

const extensions = () => [
  new LinkExtension({ autoLink: true }),
  new BoldExtension(),
  new StrikeExtension(),
  new ItalicExtension(),
  new HeadingExtension(),
  new BlockquoteExtension(),
  new BulletListExtension({ enableSpine: true }),
  new OrderedListExtension(),
  new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: true }),
  new CodeExtension(),
  new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
  new TrailingNodeExtension(),
  new TableExtension(),
  new MarkdownExtension({ copyAsMarkdown: false }),
  /**
   * `HardBreakExtension` allows us to create a newline inside paragraphs.
   * e.g. in a list item
   */
  new HardBreakExtension(),
];

const VisualEditorClassNames = [
  css`
    &.ProseMirror {
      outline: none !important;
      box-shadow: none !important;

      p,
      h3,
      h4 {
        margin-top: ${getThemeVar('space', 2)};
        margin-bottom: ${getThemeVar('space', 2)};
      }

      h1,
      h2 {
        margin-bottom: ${getThemeVar('space', 3)};
        margin-top: ${getThemeVar('space', 3)};
      }
    }
  `,
];

const basicContent = `
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

1. 有序列表01
1. 有序列表02
1. 有序列表03

* 无序列表01
* 无序列表02
* 无序列表03

正文内容。
`;

export interface iDualEditorProps {
  value?: string | null;
  onChange?: (val?: string | null) => void,
}
