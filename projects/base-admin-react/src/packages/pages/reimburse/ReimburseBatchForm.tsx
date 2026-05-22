import {iReimburseOtherRecord, iReimburseRecord, iReimburseTravelRecord, ReimburseOtherColumns, ReimburseTravelColumns} from "./reimburse.utils";
import {Button, Card, Col, Form, Input, InputNumber, Row, Space, Table} from "antd";
import {createProjectConfig} from "../project/project.utils";
import React, {useEffect, useImperativeHandle, useMemo} from "react";
import {FormInstance} from "antd/es/form/hooks/useForm";
import {showError} from "../../utils/showError";
import {AutoObject} from "../../components/AutoTable/components/AutoObject";
import {useAutoFormDrawer} from "../../components/AutoTable/useAutoFormDrawer";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolSelect} from "../../components/AutoTable/columns/AtcolSelect";
import {otherTypes, recipe_type, travelTypes} from "./generateReimburseData";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";
import {InvoiceDisplayer} from "../../components/InvoiceEditor/InvoiceDisplayer";
import {InvoiceEditor} from "../../components/InvoiceEditor/InvoiceEditor";

export const ReimburseBatchForm = React.forwardRef((
  props: {
    reimburseRecord?: iReimburseRecord,
  },
  ref,
) => {

  const [form] = Form.useForm();
  const formData = Form.useWatch(undefined, form);
  const { editRecordWithDrawer } = useAutoFormDrawer();

  useEffect(() => {
    form.setFieldsValue({
      title: null,
      proj_id: null,
      project: null,
      amount: null,
      remarks: null,
      travel_list: null,
      other_list: null,
      ...props.reimburseRecord,
    });
  }, [form, props.reimburseRecord]);

  const labelCol = useMemo(() => ({ style: { width: '120px' } }), []);

  const instance: iReimburseBatchFormInstance = { form, formData };

  useImperativeHandle(ref, () => instance);

  /*编辑差旅费用*/
  const editTravelItem = async (travelRecord: iReimburseTravelRecord) => {
    try {
      await editRecordWithDrawer({
        record: travelRecord,
        columns: [
          AtcolInput({ title: '标题', dataIndex: 'title' }),
          AtcolSelect({ title: '差旅类型', dataIndex: 'type', options: travelTypes }),
          AtcolDatetime({ title: '出发时间', dataIndex: 'depart_time', showTime: true }),
          AtcolDatetime({ title: '到达时间', dataIndex: 'arrive_time', showTime: true }),
          AtcolInput({ title: '出发城市', dataIndex: 'depart_city' }),
          AtcolInput({ title: '到达城市', dataIndex: 'arrive_city' }),
          AtcolNumber({ title: '报销金额', dataIndex: 'amount' }),
          AtcolInput({
            title: '发票信息', dataIndex: 'invoice_text',
            inlineRender: ({ value }) => <InvoiceDisplayer invoiceList={value}/>,
            inlineEditor: () => <InvoiceEditor dataType="text"/>,
            filterOption: undefined,
            sortable: false,
          }),
        ],
        save: (newTravelRecord) => {
          const newTravelList = (formData.travel_list as iReimburseTravelRecord[]).map((item): iReimburseTravelRecord => {
            if (item === travelRecord) {return { ...travelRecord, ...newTravelRecord, };}
            return item;
          });
          console.log(newTravelList);
          form.setFieldsValue({ travel_list: newTravelList });
        },
      });
    } catch (e) {
      showError(e);
    }
  };

  const deleteTravelItem = async (travelRecord: iReimburseTravelRecord) => {
    form.setFieldsValue({ travel_list: (formData.travel_list as iReimburseTravelRecord[]).filter(item => item !== travelRecord) });
  };

  /*编辑其他费用*/
  const editOtherItem = async (otherRecord: iReimburseOtherRecord) => {
    try {
      await editRecordWithDrawer({
        record: otherRecord,
        columns: [
          AtcolInput({ title: '标题', dataIndex: 'title' }),
          AtcolSelect({ title: '报销类型', dataIndex: 'type', options: otherTypes }),
          AtcolNumber({ title: '报销金额', dataIndex: 'amount' }),
          AtcolSelect({ title: '票据类型', dataIndex: 'recipe_type', options: recipe_type }),
          AtcolInput({
            title: '发票信息', dataIndex: 'invoice_text',
            inlineRender: ({ value }) => <InvoiceDisplayer invoiceList={value}/>,
            inlineEditor: () => <InvoiceEditor dataType="text"/>,
            filterOption: undefined,
            sortable: false,
          }),
        ],
        save: newOtherRecord => {
          const newOtherList = (formData.other_list as iReimburseOtherRecord[]).map((item): iReimburseOtherRecord => {
            if (item === otherRecord) {return { ...otherRecord, ...newOtherRecord, };}
            return item;
          });
          console.log(newOtherList);
          form.setFieldsValue({ other_list: newOtherList });
        }
      });
    } catch (e) {
      showError(e);
    }
  };

  const deleteOtherItem = async (otherRecord: iReimburseOtherRecord) => {
    form.setFieldsValue({ other_list: (formData.other_list as iReimburseOtherRecord[]).filter(item => item !== otherRecord) });
  };

  return (
    <Form form={form}>
      <Card title="报销单信息" style={{ marginBottom: '1em' }}>
        <Row>
          <Col span={8}>
            <Form.Item label="报销单标题" name="title" labelCol={labelCol}>
              <Input/>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="proj_id" noStyle hidden/>
            <Form.Item label="所属项目" name="project" preserve labelCol={labelCol}>
              <div>
                <AutoObject
                  config={createProjectConfig}
                  form={form}
                  field={() => formData?.project?.name}
                  map={selectedRow => {form.setFieldsValue({ project: selectedRow, proj_id: selectedRow.id, });}}
                />
              </div>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="报销金额" name="amount" labelCol={labelCol}>
              <InputNumber disabled/>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="报销备注信息" name="remarks" labelCol={labelCol}>
          <Input.TextArea/>
        </Form.Item>

      </Card>
      <Form.Item name="travel_list" noStyle>
        <Card title="差旅费用信息" style={{ marginBottom: '1em' }}>
          <Table
            rowKey={"title"/*todo*/}
            dataSource={formData?.travel_list}
            columns={[...ReimburseTravelColumns, {
              title: '操作列',
              width: '100px',
              align: 'center' as const,
              render: (_, record) => (<>
                <Space size="small">
                  <Button variant="link" color="primary" data-no-padding onClick={() => editTravelItem(record as iReimburseTravelRecord)}>编辑</Button>
                  <Button variant="link" color="danger" data-no-padding onClick={() => deleteTravelItem(record as iReimburseTravelRecord)}>删除</Button>
                </Space>
              </>)
            }]}
            pagination={false}
          />
        </Card>
      </Form.Item>
      <Form.Item name="other_list" noStyle>
        <Card title="其他费用信息" style={{ marginBottom: '1em' }}>
          <Table
            rowKey={"title"/*todo*/}
            dataSource={formData?.other_list}
            columns={[...ReimburseOtherColumns, {
              title: '操作列',
              width: '100px',
              align: 'center' as const,
              render: (_, record) => (<>
                <Space size="small">
                  <Button variant="link" color="primary" data-no-padding onClick={() => editOtherItem(record as iReimburseOtherRecord)}>编辑</Button>
                  <Button variant="link" color="danger" data-no-padding onClick={() => deleteOtherItem(record as iReimburseOtherRecord)}>删除</Button>
                </Space>
              </>)
            }]}
            pagination={false}
          />
        </Card>
      </Form.Item>
    </Form>
  );
});

export interface iReimburseBatchFormInstance {
  form: FormInstance;
  formData: any,
}
