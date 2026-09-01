const defaultInputClass =
    "w-full bg-white border-none rounded-pill pt-4 pb-4 pl-6 pr-16.5 " +
    "text-xl font-bold text-biru outline-none [font-family:inherit] box-border " +
    "placeholder:text-biru " +
    "max-md:py-2 max-md:px-4 max-md:text-sm";

const defaultIconSx = {
    position: "absolute",
    right: 25,
    color: "var(--color-olive)",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    "@media (max-width: 768px)": {
        fontSize: "1.5rem !important",
        right: 15,
    },
    };

export default function AppInput({
    type = "text",
    placeholder,
    value,
    onChange,
    icon,
    startContent,
    endContent,
    className = "",
    iconSx = {},
    width = "100%",
    style = {},
    ...props
}) {
    return (
        <div className="input-group relative flex items-center" style={{ width }}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`${defaultInputClass} ${className}`}
                style={{
                    width,
                    ...style,
                }}
                {...props}
            />

            {startContent}

            {icon && (
                <span
                className="absolute flex items-center justify-center"
                style={{
                    ...defaultIconSx,
                    ...iconSx,
                }}
                >
                {icon}
                </span>
            )}

            {endContent}
        </div>
    );
    }