import streamlit as st
from groq import Groq

st.set_page_config(page_title="VeriTruth", layout="wide")

st.title("🛡️ VeriTruth – AI Content Verification")

# Load API key securely
client = Groq(api_key=st.secrets["GROQ_API_KEY"])

text = st.text_area("Enter content to verify")

if st.button("Verify"):
    if not text.strip():
        st.warning("Please enter some text")
    else:
        with st.spinner("Analyzing..."):
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are a fake news detection expert."},
                    {"role": "user", "content": text}
                ]
            )
            st.success("Analysis Complete")
            st.write(response.choices[0].message.content)
