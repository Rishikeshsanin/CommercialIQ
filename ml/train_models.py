"""Reproducible CommercialIQ ML pipeline: forecasting, risk classification and RFM segmentation."""
from pathlib import Path
import json
import numpy as np
import pandas as pd
from joblib import dump
from sklearn.cluster import KMeans
from sklearn.ensemble import GradientBoostingClassifier,GradientBoostingRegressor,RandomForestClassifier,RandomForestRegressor
from sklearn.linear_model import LinearRegression,LogisticRegression
from sklearn.metrics import mean_absolute_error,mean_squared_error,r2_score,precision_score,recall_score,f1_score,roc_auc_score,silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
ROOT=Path(__file__).resolve().parent;ART=ROOT/'artifacts';ART.mkdir(exist_ok=True);RNG=np.random.default_rng(42)

def sales(n=1200):
 t=np.arange(n);m=RNG.normal(4200,900,n).clip(800);d=RNG.uniform(0,.18,n);y=4300+t*4.8+np.sin(2*np.pi*t/30)*260+m*.11+d*1700+RNG.normal(0,230,n);f=pd.DataFrame({'t':t,'marketing':m,'discount':d,'demand':y})
 for lag in(1,2,3,7):f[f'lag_{lag}']=f.demand.shift(lag)
 f['rolling7']=f.demand.shift(1).rolling(7).mean();return f.dropna().reset_index(drop=True)

def forecast_models(df):
 features=['t','marketing','discount','lag_1','lag_2','lag_3','lag_7','rolling7'];X,y=df[features],df.demand;cut=int(len(df)*.82);tr,te=slice(0,cut),slice(cut,None);models={'Linear Regression':LinearRegression(),'Random Forest':RandomForestRegressor(n_estimators=220,random_state=42,min_samples_leaf=2),'Gradient Boosting':GradientBoostingRegressor(random_state=42,n_estimators=180,learning_rate=.04,max_depth=3)};scores=[]
 for name,model in models.items():
  model.fit(X.iloc[tr],y.iloc[tr]);p=model.predict(X.iloc[te]);scores.append({'model':name,'mae':round(mean_absolute_error(y.iloc[te],p),2),'rmse':round(mean_squared_error(y.iloc[te],p)**.5,2),'r2':round(r2_score(y.iloc[te],p),4)})
 best=max(scores,key=lambda x:x['r2'])['model'];dump(models[best],ART/'forecast_model.joblib');return scores,best

def customers(n=6000):
 r=RNG.gamma(2.2,22,n).clip(1,220);f=RNG.gamma(2.3,4.4,n).clip(1,35);m=RNG.lognormal(10.5,.55,n).clip(4000,240000);d=RNG.beta(2,5,n);e=RNG.normal(0,.22,n);logit=-2.8+r/55-f/17-m/180000+d*1.6-e*2.4;prob=1/(1+np.exp(-logit));y=RNG.binomial(1,prob.clip(.02,.96));return pd.DataFrame({'recency':r,'frequency':f,'monetary':m,'discount_dependence':d,'engagement_delta':e,'churn':y})

def risk_models(df):
 feats=['recency','frequency','monetary','discount_dependence','engagement_delta'];X,y=df[feats],df.churn;idx=RNG.permutation(len(df));cut=int(len(df)*.8);tr,te=idx[:cut],idx[cut:];models={'Logistic Regression':Pipeline([('scale',StandardScaler()),('model',LogisticRegression(max_iter=2000,class_weight='balanced'))]),'Random Forest':RandomForestClassifier(n_estimators=220,random_state=42,class_weight='balanced',min_samples_leaf=3),'Gradient Boosting':GradientBoostingClassifier(random_state=42,n_estimators=180,learning_rate=.04,max_depth=2)};scores=[]
 for name,model in models.items():
  model.fit(X.iloc[tr],y.iloc[tr]);pr=model.predict_proba(X.iloc[te])[:,1];p=(pr>=.5).astype(int);scores.append({'model':name,'precision':round(precision_score(y.iloc[te],p,zero_division=0),4),'recall':round(recall_score(y.iloc[te],p),4),'f1':round(f1_score(y.iloc[te],p),4),'auc':round(roc_auc_score(y.iloc[te],pr),4)})
 best=max(scores,key=lambda x:x['auc'])['model'];dump(models[best],ART/'risk_model.joblib');return scores,best

def cluster(df):
 X=df[['recency','frequency','monetary']].copy();X['monetary']=np.log1p(X.monetary);pipe=Pipeline([('scale',StandardScaler()),('kmeans',KMeans(n_clusters=5,random_state=42,n_init=20))]);labels=pipe.fit_predict(X);score=silhouette_score(pipe.named_steps['scale'].transform(X),labels);dump(pipe,ART/'segment_model.joblib');return {'clusters':5,'silhouette':round(float(score),4)}

def main():
 fs,fb=forecast_models(sales());c=customers();rs,rb=risk_models(c);result={'forecasting':fs,'forecast_best':fb,'classification':rs,'risk_best':rb,'clustering':cluster(c)};(ART/'metrics.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
if __name__=='__main__':main()
