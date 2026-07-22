import pandas as pd

# 1. Filter engineered_data
df_eng = pd.read_parquet("data/processed/engineered_data.parquet")
df_eng_filtered = df_eng[df_eng["Store"] <= 10].copy()
df_eng_filtered.to_parquet("data/processed/engineered_data_demo.parquet", index=False)

# 2. Filter merged_data (Optional, for consistency)
df_merged = pd.read_parquet("data/processed/merged_data.parquet")
df_merged_filtered = df_merged[df_merged["Store"] <= 10].copy()
df_merged_filtered.to_parquet("data/processed/merged_data_demo.parquet", index=False)

print("Demo files created successfully!")