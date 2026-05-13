import { HiEye, HiRocketLaunch, HiStar, HiBolt, HiBeaker, HiHandRaised, HiGlobeAlt } from "react-icons/hi2";

export default function VisiMisiSection() {
  return (
    <div className="space-y-16">
      {/* Visi */}
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-primary-950 mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-sm">
            <HiEye />
          </span>
          Visi
        </h2>
        <div className="relative bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-2xl p-6 sm:p-8 border-l-4 border-primary-600">
          <p className="text-lg sm:text-xl text-primary-900 font-medium leading-relaxed italic">
            &ldquo;Menjadi program studi unggulan di tingkat nasional dalam bidang teknik
            ketenagalistrikan yang menghasilkan lulusan profesional, inovatif, dan berdaya saing
            global pada tahun 2030.&rdquo;
          </p>
        </div>
      </div>

      {/* Misi */}
      <div className="animate-fade-in-up delay-200">
        <h2 className="text-xl font-bold text-primary-950 mb-6 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-sm">
            <HiRocketLaunch />
          </span>
          Misi
        </h2>
        <div className="grid gap-4">
          {[
            "Menyelenggarakan pendidikan vokasi yang berkualitas di bidang teknik ketenagalistrikan berbasis kompetensi industri.",
            "Melaksanakan penelitian terapan yang inovatif dan bermanfaat bagi pengembangan ilmu pengetahuan dan teknologi ketenagalistrikan.",
            "Menyelenggarakan pengabdian kepada masyarakat dalam bidang ketenagalistrikan untuk meningkatkan kesejahteraan masyarakat.",
            "Menjalin kerja sama dengan industri, pemerintah, dan institusi pendidikan dalam dan luar negeri.",
            "Mengembangkan tata kelola program studi yang transparan, akuntabel, dan berkelanjutan.",
          ].map((misi, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed pt-1">{misi}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tujuan */}
      <div className="animate-fade-in-up delay-400">
        <h2 className="text-xl font-bold text-primary-950 mb-6 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 text-sm">
            <HiStar />
          </span>
          Tujuan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Lulusan Berkompeten",
              desc: "Menghasilkan lulusan yang memiliki kompetensi teknis dan soft skill sesuai kebutuhan industri ketenagalistrikan.",
              icon: <HiBolt className="text-2xl" />,
            },
            {
              title: "Penelitian Terapan",
              desc: "Menghasilkan karya penelitian terapan yang dapat memberikan solusi terhadap permasalahan ketenagalistrikan.",
              icon: <HiBeaker className="text-2xl" />,
            },
            {
              title: "Pengabdian Masyarakat",
              desc: "Memberikan kontribusi nyata kepada masyarakat melalui penerapan ilmu dan teknologi ketenagalistrikan.",
              icon: <HiHandRaised className="text-2xl" />,
            },
            {
              title: "Kerja Sama Strategis",
              desc: "Membangun jaringan kerja sama yang luas dengan stakeholder di tingkat nasional dan internasional.",
              icon: <HiGlobeAlt className="text-2xl" />,
            },
          ].map((tujuan, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-2xl mb-3 text-primary-600 group-hover:scale-110 transition-transform duration-300">
                {tujuan.icon}
              </div>
              <h3 className="font-bold text-primary-950 text-base mb-2">{tujuan.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{tujuan.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
