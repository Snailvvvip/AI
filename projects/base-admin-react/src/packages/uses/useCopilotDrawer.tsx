import {useDrawer} from "./useDrawer";
import {useCallback} from "react";
import {ChatCopilot} from "../components/ChatCopilot/ChatCopilot";
import {iChatCopilotProps} from "../components/ChatPublic/chat-public.utils";

export function useCopilotDrawer() {
  const { openDrawer } = useDrawer();

  const openChatBox = useCallback((param: iCopilotDrawerParam) => {

    const { closeDrawer } = openDrawer({
      drawerClassName: 'auto-table-chatbox-drawer',
      content: (
        <ChatCopilot
          handleClose={() => closeDrawer()}
          {...param}
        />
      ),
      drawerProps: { title: null },
      drawerWidth: 400,
      handleConfirm: async () => {
        return true;
      },
      handleCancel: () => {}
    });

    const closeChatbox = closeDrawer;

    return { closeChatbox };

  }, [openDrawer]);

  return { openChatBox };
}

export type iCopilotDrawer = ReturnType<typeof useCopilotDrawer>

export type iCopilotDrawerParam = Omit<iChatCopilotProps, 'handleClose'>
