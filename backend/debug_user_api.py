import requests
import json
import traceback

# API基本URL
base_url = "http://localhost:8000/api"

def login(username, password):
    """登录并获取token"""
    login_url = f"{base_url}/auth/login"
    response = requests.post(
        login_url,
        data={
            "username": username,
            "password": password
        }
    )
    if response.status_code == 200:
        result = response.json()
        return result["data"]["access_token"]
    else:
        print(f"登录失败: {response.status_code} - {response.text}")
        return None

def create_user(token, user_data):
    """创建新用户，包含详细错误信息"""
    url = f"{base_url}/users"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    try:
        print(f"创建用户请求数据: {json.dumps(user_data, ensure_ascii=False)}")
        print(f"请求URL: {url}")
        print(f"请求头: {headers}")
        
        response = requests.post(url, headers=headers, json=user_data)
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"创建用户失败: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"创建用户过程中出现异常: {str(e)}")
        print(traceback.format_exc())
        return None

def pretty_print(data):
    """美化输出JSON数据"""
    print(json.dumps(data, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    # 登录
    print("正在登录...")
    token = login("admin", "password")
    if not token:
        print("登录失败，无法继续测试")
        exit(1)
    
    print(f"登录成功，token: {token}")
    
    # 创建一个随机用户名，避免用户名已存在的问题
    import random
    import string
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    
    # 测试创建新用户
    print("\n创建新用户:")
    new_user_data = {
        "username": f"testuser_{random_suffix}",
        "password": "password123",
        "email": f"testuser_{random_suffix}@example.com",
        "phone": "13800138000",
        "real_name": "测试用户",
        "status": True
    }
    create_user_result = create_user(token, new_user_data)
    if create_user_result:
        print("创建用户成功:")
        pretty_print(create_user_result)
    else:
        print("创建用户失败") 