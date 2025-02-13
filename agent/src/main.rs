use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use genai::{
    chat::{ChatMessage, ChatRequest},
    Client,
};
use serde::{Deserialize, Serialize};
use shuttle_runtime::SecretStore;
use std::{env, process::Command};
use tempfile::NamedTempFile;

#[derive(Serialize, Deserialize)]
struct ContractCode {
    code: String,
    move_toml: String,
}

#[derive(Serialize, Deserialize)]
struct ChatWithAssistantRequest {
    question: String,
}

#[derive(Serialize, Deserialize)]
struct VulnerabilitiesResponse {
    vulnerabilities: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct CompileResponse {
    status: String,
}

#[derive(Serialize, Deserialize)]
struct DeployResponse {
    status: String,
}

#[derive(Serialize)]
struct Error {
    message: String,
}

#[derive(Serialize)]
struct Endpoints {
    endpoints: Vec<String>,
}

const MODEL_OPENAI: &str = "gpt-4o-mini";
const API_KEY_OPENAI: &str = "OPENAI_API_KEY";

fn ai_agent() -> Client {
    env::var(API_KEY_OPENAI).expect("OPENAI API KEY not set in environment");
    let agent: Client = Client::default();
    agent
}

async fn query_agent(prompt: String) -> String {
    let chat_req: ChatRequest = ChatRequest::new(vec![ChatMessage::system(prompt)]);
    let agent: Client = ai_agent();
    match agent.exec_chat(MODEL_OPENAI, chat_req.clone(), None).await {
        Ok(response) => match response.content_text_into_string() {
            Some(r) => r,
            None => "No response".to_string(),
        },
        Err(e) => {
            println!("Error: {}", e);
            "Error response".to_string()
        }
    }
}

async fn home() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(Endpoints {
            endpoints: vec![
                "GET /".to_string(),
                "POST /audit".to_string(),
                "POST /compile".to_string(),
                "POST /deploy".to_string(),
                "POST /chat".to_string(),
                "GET /movement".to_string(),
            ],
        }),
    )
}

async fn not_found() -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        Json(Error {
            message: "Resource not found".to_string(),
        }),
    )
}

async fn audit_contract(Json(_payload): Json<ContractCode>) -> Json<VulnerabilitiesResponse> {
    // let prompt = format!(
    //     "Audit the following smart contract code for vulnerabilities:\n{}",
    //     payload.code
    // );
    //let client = OpenAIClient::new("your-openai-api-key");
    //let response = client.complete(prompt).await.unwrap();
    //let vulnerabilities = response.choices[0].text.split('\n').map(|s| s.to_string()).collect();
    let audit_response = audit(_payload.code).await;
    println!("Audit response: {}", audit_response);
    let vulnerabilities = vec![];
    Json(VulnerabilitiesResponse { vulnerabilities })
}

async fn compile_contract(Json(_payload): Json<ContractCode>) -> Json<CompileResponse> {
    // let mut contract_file = NamedTempFile::new().unwrap();
    // let mut move_toml_file = NamedTempFile::new().unwrap();
    // contract_file.write_all(payload.code.as_bytes()).unwrap();
    // move_toml_file.write_all(payload.move_toml.as_bytes()).unwrap();
    let contract_file = NamedTempFile::new().unwrap();

    let output = Command::new("movement")
        .arg("move")
        .arg("compile")
        .arg("--package-dir")
        .arg(contract_file.path().parent().unwrap())
        .output()
        .unwrap();

    let status = if output.status.success() {
        "success".to_string()
    } else {
        String::from_utf8_lossy(&output.stderr).to_string()
    };

    Json(CompileResponse { status })
}

async fn deploy_contract(Json(_payload): Json<ContractCode>) -> Json<DeployResponse> {
    //let mut contract_file = NamedTempFile::new().unwrap();
    //let mut move_toml_file = NamedTempFile::new().unwrap();
    // contract_file.write_all(payload.code.as_bytes()).unwrap();
    // move_toml_file.write_all(payload.move_toml.as_bytes()).unwrap();
    let contract_file = NamedTempFile::new().unwrap();

    let output = Command::new("movement")
        .arg("move")
        .arg("publish")
        .arg("--package-dir")
        .arg(contract_file.path().parent().unwrap())
        .output()
        .unwrap();

    let status = if output.status.success() {
        "success".to_string()
    } else {
        String::from_utf8_lossy(&output.stderr).to_string()
    };

    Json(DeployResponse { status })
}

async fn movement() -> impl IntoResponse {
    let output = Command::new("movement").arg("move").arg("--help").output();
    match output {
        Ok(o) => {
            let status: String = if o.status.success() {
                String::from_utf8_lossy(&o.stdout).to_string()
            } else {
                String::from_utf8_lossy(&o.stderr).to_string()
            };

            (StatusCode::OK, Json(status))
        }
        Err(error) => {
            println!("Command error: {}", error);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json("Command error".to_string()),
            )
        }
    }
}

async fn chat_with_ai(Json(_payload): Json<ChatWithAssistantRequest>) -> Json<String> {
    // let client = OpenAIClient::new("your-openai-api-key");
    // let response = client.complete(payload.question).await.unwrap();
    let chat_response = chat(_payload.question).await;
    println!("Chat response: {}", chat_response);
    let response = "OK".to_string();
    //Json(response.choices[0].text)
    Json(response)
}

async fn chat(question: String) -> String {
    if question.trim().is_empty() {
        return "Empty question".to_string();
    }

    let prompt: String = format!(
        r#"You are blockchain expert specializing in Aptos Move smart contracts. 
        Answer this question:
        {}
        "#,
        question
    );

    query_agent(prompt).await
}

async fn audit(code: String) -> String {
    if code.trim().is_empty() {
        return "Empty code".to_string();
    }

    let prompt: String = format!(
        r#"You are blockchain expert specializing in Aptos Move smart contracts. 
        Audit this code for vulnerabilities:
        {}
        "#,
        code
    );

    query_agent(prompt).await
}

#[shuttle_runtime::main]
async fn axum(#[shuttle_runtime::Secrets] secrets: SecretStore) -> shuttle_axum::ShuttleAxum {
    let openai_api_key: String = secrets
        .get("OPENAI_API_KEY")
        .expect("OpenAI API KEY is not set");
    std::env::set_var("OPENAI_API_KEY", openai_api_key);
    println!("OpenAI API key set");
    let router = Router::new()
        .route("/", get(home))
        .route("/audit", post(audit_contract))
        .route("/compile", post(compile_contract))
        .route("/deploy", post(deploy_contract))
        .route("/movement", get(movement))
        .route("/chat", post(chat_with_ai))
        .fallback(get(not_found));
    Ok(router.into())
}
