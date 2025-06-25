// 測試數據
export const mockData = {
  livers: [
    {
      id: "uki_violeta",
      name: {
        en: "Uki Violeta",
        jp: "浮奇・ヴィオレタ"
      },
      branch: "EN",
      oshi_color_code: "#B452FF"
    },
    {
      id: "kenmochi_toya",
      name: {
        en: "Kenmochi Toya",
        jp: "剣持刀也"
      },
      branch: "JP",
      oshi_color_code: "#7243D1"
    },
    {
      id: "kagami_hayato",
      name: {
        en: "Kagami Hayato",
        jp: "加賀美ハヤト"
      },
      branch: "JP",
      oshi_color_code: "#FF6B35"
    },
    {
      id: "fuwa_minato",
      name: {
        en: "Fuwa Minato",
        jp: "不破湊"
      },
      branch: "JP",
      oshi_color_code: "#00A0E9"
    }
  ],
  
  groups: [
    {
      id: "roflmao",
      name: "ROF-MAO",
      liver_ids: ["kagami_hayato", "kenmochi_toya", "fuwa_minato"]
    }
  ],
  
  voiceSeries: [
    {
      series_id: "seasonal_2025_spring",
      title: "にじさんじ季節ボイス2025 Spring",
      liver_ids: ["uki_violeta"],
      group_ids: [],
      initial_release_date: "2025-03-01",
      rerelease_dates: ["2026-03-01"],
      cover_image_url: "https://via.placeholder.com/400x400/B452FF/FFFFFF?text=Spring+2025"
    },
    {
      series_id: "rofmao_1st_anniv",
      title: "ROF-MAO 1st Anniversary Voice",
      liver_ids: [],
      group_ids: ["roflmao"],
      initial_release_date: "2022-10-21",
      rerelease_dates: [],
      cover_image_url: "https://via.placeholder.com/400x400/FF6B35/FFFFFF?text=ROF-MAO+1st"
    },
    {
      series_id: "winter_2024",
      title: "にじさんじ冬ボイス2024",
      liver_ids: ["kenmochi_toya", "fuwa_minato"],
      group_ids: [],
      initial_release_date: "2024-12-01",
      rerelease_dates: [],
      cover_image_url: "https://via.placeholder.com/400x400/7243D1/FFFFFF?text=Winter+2024"
    }
  ],
  
  voiceProducts: [
    {
      product_id: "uki_spring2025_en",
      series_id: "seasonal_2025_spring",
      liver_id: "uki_violeta",
      title: "English ver.",
      type: "Regular",
      language: "EN",
      file_hash_sha256: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
    },
    {
      product_id: "uki_spring2025_ex_en",
      series_id: "seasonal_2025_spring",
      liver_id: "uki_violeta",
      title: "EX voice English ver.",
      type: "EX",
      language: "EN",
      file_hash_sha256: null
    },
    {
      product_id: "rofmao_anniv_group",
      series_id: "rofmao_1st_anniv",
      liver_id: "kagami_hayato",
      title: "Group Anniversary Voice",
      type: "Regular",
      language: "JP",
      file_hash_sha256: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567"
    },
    {
      product_id: "kenmochi_winter2024",
      series_id: "winter_2024",
      liver_id: "kenmochi_toya",
      title: "冬の挨拶ボイス",
      type: "Regular",
      language: "JP",
      file_hash_sha256: "c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678"
    },
    {
      product_id: "fuwa_winter2024",
      series_id: "winter_2024",
      liver_id: "fuwa_minato",
      title: "冬の挨拶ボイス",
      type: "Regular",
      language: "JP",
      file_hash_sha256: "d4e5f6789012345678901234567890abcdef1234567890abcdef123456789"
    }
  ]
};

