import {useState} from "react";
import {Button, Drawer, Steps} from "antd";
import {iApproveLog, iApproveProjRecord} from "./approve.utils";

export function useApproveStepViewer() {

  const [showDrawer, setShowDrawer] = useState(false);
  const [approveLogs, setApproveLogs] = useState([] as iApproveLog[]);

  const content = (
    <Drawer
      title="审批日志"
      open={showDrawer}
      afterOpenChange={setShowDrawer}
      onClose={() => setShowDrawer(false)}
    >
      <Steps
        direction="vertical"
        size="small"
        current={1}
        items={approveLogs.reverse().map(item => ({
          title: item.datetime,
          status: 'process',
          description: item.content,
        }))}
      />
    </Drawer>
  );

  const buttonRender = (record: iApproveProjRecord) => (
    <>
      <Button
        type="link"
        onClick={() => {
          setApproveLogs(JSON.parse(record.logs ?? '[]'));
          setShowDrawer(true);
        }}>
        审批日志
      </Button>
    </>
  );

  return {
    buttonRender,
    content
  };
}
