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
use std::{
    env,
    fs::{self, File},
    io::Write,
    process::Command,
};
// use tempfile::NamedTempFile;

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

// #[derive(Serialize, Deserialize)]
// struct CompileResponse {
//     status: String,
// }

// #[derive(Serialize, Deserialize)]
// struct DeployResponse {
//     status: String,
// }

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
    let audit_response = audit(_payload.code).await;
    println!("Audit response: {}", audit_response);
    let vulnerabilities = vec![];
    Json(VulnerabilitiesResponse { vulnerabilities })
}

async fn compile_contract(Json(_payload): Json<ContractCode>) -> impl IntoResponse {
    if _payload.code.trim().is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json("Empty code".to_string()),
        );
    }

    if _payload.move_toml.trim().is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json("Empty manifest".to_string()),
        );
    }

    // Create a new temporary directory
    let temp_dir = tempfile::tempdir().unwrap();

    // Create a new folder inside the temporary directory
    let new_folder = temp_dir.path().join("new_folder");
    fs::create_dir(&new_folder).unwrap();

    // Create Move.toml file inside the new folder
    let move_toml_path = new_folder.join("Move.toml");
    let mut move_toml_file = File::create(&move_toml_path).unwrap();
    move_toml_file.write_all(b"manifest").unwrap();

    // Create sources folder inside the new folder
    let sources_folder = new_folder.join("sources");
    fs::create_dir(&sources_folder).unwrap();

    // Create contract.move file inside the sources folder
    let contract_move_path = sources_folder.join("contract.move");
    let mut contract_move_file = File::create(&contract_move_path).unwrap();
    contract_move_file.write_all(b"hello").unwrap();

    println!(
        "Contract files and folders created at: {:?}",
        temp_dir.path()
    );

    // The temporary directory and its contents will be automatically deleted when `temp_dir` goes out of scope

    let output = Command::new("aptos")
        .arg("move")
        .arg("compile")
        .arg("--package-dir")
        .arg(temp_dir.path())
        .output();

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
            println!("Compile command error: {}", error);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json("Command error".to_string()),
            )
        }
    }
}

async fn deploy_contract(Json(_payload): Json<ContractCode>) -> impl IntoResponse {
    if _payload.code.trim().is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json("Empty code".to_string()),
        );
    }

    if _payload.move_toml.trim().is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json("Empty manifest".to_string()),
        );
    }

    // Create a new temporary directory
    let temp_dir = tempfile::tempdir().unwrap();

    // Create a new folder inside the temporary directory
    let new_folder = temp_dir.path().join("new_folder");
    fs::create_dir(&new_folder).unwrap();

    // Create Move.toml file inside the new folder
    let move_toml_path = new_folder.join("Move.toml");
    let mut move_toml_file = File::create(&move_toml_path).unwrap();
    move_toml_file.write_all(b"manifest").unwrap();

    // Create sources folder inside the new folder
    let sources_folder = new_folder.join("sources");
    fs::create_dir(&sources_folder).unwrap();

    // Create contract.move file inside the sources folder
    let contract_move_path = sources_folder.join("contract.move");
    let mut contract_move_file = File::create(&contract_move_path).unwrap();
    contract_move_file.write_all(b"hello").unwrap();

    println!(
        "Contract files and folders created at: {:?}",
        temp_dir.path()
    );

    // The temporary directory and its contents will be automatically deleted when `temp_dir` goes out of scope

    let output = Command::new("aptos")
        .arg("move")
        .arg("publish")
        .arg("--package-dir")
        .arg(temp_dir.path())
        .output();

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
            println!("Deploy command error: {}", error);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json("Command error".to_string()),
            )
        }
    }
}

async fn movement() -> impl IntoResponse {
    let output = Command::new("aptos").arg("move").arg("--help").output();
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
    let chat_response: String = chat(_payload.question).await;
    println!("Chat response: {}", chat_response);
    Json(chat_response)
}

async fn chat(question: String) -> String {
    if question.trim().is_empty() {
        return "Empty question".to_string();
    }

    let prompt: String = format!(
        r#"You are blockchain expert specializing in Aptos Move smart contracts. 
        Answer this question shortly:
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
