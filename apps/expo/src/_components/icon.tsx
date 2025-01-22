import { memo, useMemo } from "react";
import { icons } from "lucide-react-native";
import { cssInterop } from "nativewind";

type IconName = keyof typeof icons;
interface IconProps {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = memo(({ name, className }) => {
  const CustomIcon = useMemo(() => {
    const Icon = icons[name];
    Icon.displayName = name;

    return cssInterop(Icon, {
      className: {
        target: "style",
        nativeStyleToProp: {
          color: true,
          width: true,
          height: true,
        },
      },
    });
  }, [name]);

  return <CustomIcon className={className} />;
});

export default Icon;
