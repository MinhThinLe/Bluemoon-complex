curl localhost:3030 -H "Authorization: Basic YWRtaW46cGFzc3dvcmQK" 2> /dev/null

if [[ $? != 0  ]]; then
    echo Unable to authenticate
    exit 1
fi
