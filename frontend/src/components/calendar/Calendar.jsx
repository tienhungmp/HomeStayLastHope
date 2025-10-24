import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import events from "./events";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Form, DatePicker, Input, InputNumber, Modal, Radio, Select, TimePicker } from "antd";
import { useForm } from "antd/es/form/Form";
import ButtonCustom from "../Button/ButtonCustom";
import { ToastNoti, ToastNotiError, getDate } from "../../utils/Utils";
import Constants from "../../utils/constants";
import Factories from "../../services/FactoryApi";
import { red } from "@mui/material/colors";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);


function eventStyleGetter(event, start, end, isSelected) {
    var backgroundColor = Constants.optionStatusCl.find(item => item.value == event.status).color
    var style = {
        backgroundColor: backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: '#fff',
        border: '0px',
        display: 'block'
    };
    return {
        style: style
    };
}

export default function ReactBigCalendar(props) {
    const { data = [], canView = false, onSelectEventDate, canUpdate = false, onReload } = props;
    const [loading, setLoading] = useState();
    const [editCal, setEditCal] = useState(false);
    const [openModelDetail, setOpenModelDetail] = useState();
    // const handleSelect = ({ start, end }) => {
    //     const title = window.prompt("New Event name");
    //     if (title)
    //         setEventsData([
    //             ...eventsData,
    //             {
    //                 start,
    //                 end,
    //                 title
    //             }
    //         ]);
    // };


    const formItemLayout = {
        labelCol: {
            xs: {
                span: 24
            },
            sm: {
                span: 6,
            },
        },
        wrapperCol: {
            xs: {
                span: 12,
            },
            sm: {
                span: 24,
            },
        },
    };
    const [form] = useForm()
    const onFinish = async (data) => {
        setLoading(true)
        try {
            let newData = { ...data }
            newData.doctorId = openModelDetail.doctorId
            newData.id = openModelDetail.id
            newData.status = data.status
            const parsedNewDate = new Date(newData?.date);
            const time = newData?.time?.map(dateString => {
                const parsedDate = new Date(dateString);
                parsedDate.setFullYear(parsedNewDate.getFullYear());
                parsedDate.setMonth(parsedNewDate.getMonth());
                parsedDate.setDate(parsedNewDate.getDate());
                return parsedDate.toISOString();
            });
            newData.time = time
            newData.note = watchNote
            const response = await Factories.updateDoctorSchedule(newData);
            if (response._id) {
                ToastNoti()
                setOpenModelDetail();
                setEditCal(false);
            } else {
                ToastNotiError(response?.message)
                const logTime = response?.schedule
                if (logTime) {
                    const errorMessage = `Lịch khám đã tồn lại lúc: ${getDate(logTime?.overlappingTimeStart, 6)} - ${getDate(logTime?.overlappingTimeEnd, 6)}`
                    setLoading(false)
                    form.setFields([
                        {
                            name: 'time',
                            errors: [errorMessage],
                        },
                    ]);
                }
            }
            setOpenModelDetail(null)
            form.resetFields()
            onReload()
            setLoading(false)
        } catch (error) {
            onReload()
            ToastNotiError(error);
        }
    };

    const watchNote = Form.useWatch('note', form);


    async function handleDelete() {
        try {
            const response = await Factories.deleteSchedule(openModelDetail.id);
            if (response.message) {
                ToastNoti(response.message)
                onReload && onReload()
                setEditCal()
                setOpenModelDetail()
            } else {
                ToastNotiError(response.error)
            }
        } catch (error) {
            setOpenModelDetail()
            ToastNotiError(error?.response?.data.error)
        }

    }
    useEffect(() => {
        if (openModelDetail) {
            const time1 = getDate(openModelDetail.timeStart, 4);
            const time2 = getDate(openModelDetail.timeEnd, 4);
            form.setFieldsValue({
                branchName: openModelDetail.branchName,
                service: openModelDetail.service,
                doctorId: openModelDetail.doctorId,
                departmentName: openModelDetail.departmentName,
                date: getDate(openModelDetail?.date, 4),
                price: openModelDetail.price,
                time: [time1, time2],
                note: openModelDetail.note,
                status: openModelDetail.status,
            });
        }
    }, [openModelDetail])


    function disabledDate(current) {
        return current && current < moment().startOf('day');
    }



    function onSelectEvent(event) {
        if (canView) {
            onSelectEventDate(event)
        } else {
            setOpenModelDetail(event)
        }
    }
    return (
        <div className="App">
            <Calendar
                views={["day", "agenda", "work_week", "month"]}
                selectable
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="month"
                events={data}
                style={{ height: "100vh" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event) => onSelectEvent(event)}
            // onSelectSlot={handleSelect}
            />
            <Modal
                title={<span className='text-2xl  font-bold text-blue'>Thông tin lịch khám</span>}
                open={openModelDetail}
                width={700}
                onCancel={() => {
                    setOpenModelDetail(null)
                    setLoading(false)
                }}
                footer=""
            >
                <Form
                    {...formItemLayout}
                    variant="filled"
                    form={form}
                    onFinish={onFinish}
                >

                    <Form.Item
                        label="Bệnh viện"
                        name="branchName"
                        rules={[
                            {
                                required: true,
                                message: 'Bạn chưa thuộc bệnh viên nào cả.',
                            },
                        ]}
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        label="Chuyên khoa"
                        name="departmentName"
                        rules={[
                            {
                                required: true,
                                message: 'Bắt buộc nhập!',
                            },
                        ]}
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        label="Chọn dịch vụ khám"
                        name="service"
                        rules={[
                            {
                                required: true,
                                message: 'Bắt buộc chọn',
                            },
                        ]}
                    >

                        <Radio.Group disabled={!editCal} buttonStyle="solid">
                            <Radio.Button value={1}>Khám trong giờ</Radio.Button>
                            <Radio.Button value={2}>Khám ngoài giờ</Radio.Button>
                            <Radio.Button value={3}>Khám online</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        label="Ngày khám"
                        name="date"
                        rules={[
                            {
                                required: true,
                                message: 'Bắt buộc nhập!',
                            },
                        ]}
                    >
                        <DatePicker disabled={!editCal} disabledDate={disabledDate} placeholder="yyyy/mm/dd" />
                    </Form.Item>

                    <Form.Item
                        label="Giờ khám"
                        name="time"
                        rules={[
                            {
                                required: true,
                                message: 'Bắt buộc nhập!',
                            },
                        ]}
                    >
                        <TimePicker.RangePicker disabled={!editCal} format={'HH:mm'} />
                    </Form.Item>

                    <Form.Item
                        label="Giá khám"
                        name="price"
                    >

                        <InputNumber
                            addonAfter={'VNĐ'}
                            // initialValues={0}
                            max={1000000000}
                            disabled={!editCal}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                    >
                        <Select disabled options={Constants.optionStatusCl} />
                    </Form.Item>

                    <Form.Item
                        label="Phản hồi từ trưởng khoa"
                        name="note"
                    >
                        <Input.TextArea disabled={!canUpdate} />
                    </Form.Item>

                    <Form.Item
                        // wrapperCol={{
                        //     offset: 16,
                        //     span: 24,
                        // }}
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        {editCal ?
                            <ButtonCustom
                                type='submit'
                                htmlType="submit"
                                loading={loading}
                            >
                                Lưu thông tin
                            </ButtonCustom>
                            :
                            <div className="flex flex-row gap-1 justify-end w-full">

                                {canUpdate ?
                                    <>
                                        {
                                            openModelDetail?.status !== 3 && openModelDetail?.status !== 4 &&
                                            <>
                                                <ButtonCustom
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid red',
                                                        color: 'red',
                                                    }}
                                                    onClick={() => onFinish({ status: 2 })}
                                                >
                                                    Từ chối lịch khám
                                                </ButtonCustom>
                                                <ButtonCustom
                                                    onClick={() => onFinish({ status: 3 })}
                                                >
                                                    Duyệt lịch khám
                                                </ButtonCustom>
                                            </>
                                        }
                                    </>
                                    :
                                    <>
                                        {
                                            openModelDetail?.status !== 3 && openModelDetail?.status !== 4 && <>
                                                <ButtonCustom
                                                    onClick={() => handleDelete()}
                                                >
                                                    Xóa
                                                </ButtonCustom>
                                                <ButtonCustom
                                                    onClick={() => setEditCal(true)}
                                                >
                                                    Chỉnh Sửa
                                                </ButtonCustom>
                                            </>
                                        }

                                    </>
                                }


                            </div>
                        }
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    );
}
