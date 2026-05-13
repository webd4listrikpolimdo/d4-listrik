interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 pt-28 pb-16 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-accent-400 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-primary-400 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white animate-fade-in-up">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-primary-200 text-lg max-w-2xl animate-fade-in-up delay-100">
            {subtitle}
          </p>
        )}
        <div className="mt-4 h-1 w-16 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full animate-fade-in-up delay-200" />
      </div>
    </section>
  );
}
