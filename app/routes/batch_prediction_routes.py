from fastapi import APIRouter, UploadFile, File, HTTPException

from fastapi.encoders import jsonable_encoder

import pandas as pd
import io
import json

from src.components.prediction_manager import PredictionManager

router = APIRouter(prefix="/predict/batch", tags=["Batch Prediction"])

manager = PredictionManager()


@router.post("/")
async def batch_predict(file: UploadFile = File(...)):

    try:

        contents = await file.read()

        filename = file.filename.lower()

        if filename.endswith(".csv"):

            df = pd.read_csv(io.BytesIO(contents))

        elif filename.endswith(".xlsx"):

            df = pd.read_excel(io.BytesIO(contents))

        else:

            raise HTTPException(
                status_code=400, detail="Only CSV and Excel files are supported."
            )

        result = manager.predict(df, generate_explanations=False)

        predictions = result["predictions"].to_json(orient="records", date_format="iso")

        return jsonable_encoder({"predictions": json.loads(predictions)})

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))
