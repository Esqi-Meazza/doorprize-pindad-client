import { useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    } from "@mui/material";
import Picker from "react-mobile-picker";

const years = Array.from(
    { length: 100 },
    (_, i) => `${2026 - i}`
);

const monthMap = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    Mei: "05",
    Jun: "06",
    Jul: "07",
    Agu: "08",
    Sep: "09",
    Okt: "10",
    Nov: "11",
    Des: "12",
};

const days = Array.from(
    { length: 31 },
    (_, i) => String(i + 1).padStart(2, "0")
);

export default function AppDatePicker({
    value,
    onChange,
    label = "Tanggal",
    title = "PILIH TANGGAL",
    icon = null,
}) {
    const [open, setOpen] = useState(false);

    const [pickerValue, setPickerValue] = useState({
        day: value?.day || "01",
        month: value?.month || "Jan",
        year: value?.year || "2000",
    });

    const handleOpen = () => {
        setPickerValue({
        day: value?.day || "01",
        month: value?.month || "Jan",
        year: value?.year || "2000",
        });

    setOpen(true);
    };

    const handleSave = () => {
        const date = `${pickerValue.year}-${monthMap[pickerValue.month]}-${pickerValue.day}`;

        onChange({
        date,
        day: pickerValue.day,
        month: pickerValue.month,
        year: pickerValue.year,
        });

        setOpen(false);
    };

    return (
        <>
        <div className="input-group relative flex items-center">
            <button
            type="button"
            onClick={handleOpen}
            className="
                btn-submit btn-date-picker rounded-pill w-full
                flex items-center justify-self-start text-left relative
                md:p-4 p-2.5 bg-white text-biru
                cursor-pointer active:scale-99 smooth-transition
            "
            >
            <span className="text-biru text-sm md:text-md font-bold">
                {label} : {value?.day} {value?.month} {value?.year}
            </span>

            {icon && (
                <span
                className="
                    absolute right-6.25 top-1/2
                    -translate-y-1/2
                    flex items-center justify-center
                    text-olive
                    max-md:right-4
                "
                >
                {icon}
                </span>
            )}
            </button>
        </div>

        <Drawer
            anchor="bottom"
            open={open}
            onClose={() => setOpen(false)}
        >
            <Box p={3}>
            <Typography
                variant="h6"
                mb={2}
                sx={{
                fontWeight: "bold",
                color: "var(--color-biru)",
                textAlign: "center",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--color-biru)",
                }}
            >
                {title}
            </Typography>

            <Picker
                value={pickerValue}
                onChange={setPickerValue}
                wheelMode="normal"
            >
                <Picker.Column name="day">
                {days.map((day) => (
                    <Picker.Item key={day} value={day}>
                    {day}
                    </Picker.Item>
                ))}
                </Picker.Column>

                <Picker.Column name="month">
                {Object.keys(monthMap).map((month) => (
                    <Picker.Item key={month} value={month}>
                    {month}
                    </Picker.Item>
                ))}
                </Picker.Column>

                <Picker.Column name="year">
                {years.map((year) => (
                    <Picker.Item key={year} value={year}>
                    {year}
                    </Picker.Item>
                ))}
                </Picker.Column>
            </Picker>

            <button
                type="button"
                onClick={handleSave}
                className="
                mt-4 w-full
                bg-biru text-white
                font-bold
                py-4
                rounded-lg
                "
            >
                Simpan
            </button>
            </Box>
        </Drawer>
        </>
    );
}