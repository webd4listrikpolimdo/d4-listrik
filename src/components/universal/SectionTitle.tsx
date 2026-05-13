interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

export default function SectionTitle({ title, subtitle, center = false }: SectionTitleProps) {
  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-primary-950">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-gray-500 max-w-xl text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
      <div
        className={`mt-3 h-1 w-12 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full ${
          center ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
