
'use strict';
require('./index.css');
require('page/common/nav-simple/index.js');
var _user   = require('service/user-service.js');
var _mm     = require('util/mm.js');

// 表单里的错误提示
var formError = {
    show : function(errMsg){
        $('.error-item').show().find('.err-msg').text(errMsg);
    },
    hide : function(){
        $('.error-item').hide().find('.err-msg').text('');
    }
};


// page 逻辑部分
var page = {
    init: function(){
        this.bindEvent();
		
    },
    bindEvent : function(){
        var _this = this;
        // 验证username
        $('#username').blur(function(){
            var username = $.trim($(this).val());
            // 如果用户名为空，我们不做验证
            if(!username){
                return;
            }
            // 异步验证用户名是否存在
            _user.checkUsername(username, function(res){
                formError.hide();
            }, function(errMsg){
                formError.show(errMsg);
            });
        });
		$('#sendSMS').click(function(){
			_this.sendsms();
		});
        // 注册按钮的点击
        $('#submit').click(function(){
            _this.submit();
        });
        // 如果按下回车，也进行提交
        $('.user-content').keyup(function(e){
            // keyCode == 13 表示回车键
            if(e.keyCode === 13){
                _this.submit();
            }
        });
    },
	sendsms: function(){
				
		        var phone = $('input[name=phone]').val().trim();
				if(phone===""){
					formError.show("请输入手机号");
					return;
				}else{
					if(!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(phone))){
					formError.show("手机号输入格式有误");
					return;
				}else{	
						var btn_sms = document.getElementById("sendSMS");
						btn_sms.disabled = true;   //当点击后倒计时时候不能点击此按钮
						var time = 60;   //倒计时60秒
						var timer = setInterval(fun1, 1000);    //设置定时器
						function fun1() {
						    time--;
						    if(time>=0) {
						        btn_sms.innerHTML = time + "s后重新发送";
								btn_sms.disabled = true;
						    }else{
						        btn_sms.innerHTML = "重新发送验证码";
								$(".sendSMS").attr("disabled", false);
						        btn_sms.disabled = false;    //倒计时结束能够重新点击发送的按钮
						        clearTimeout(timer);    //清除定时器
						        time = 2;   //设置循环重新开始条件
						    }
						}
						console.log("获取短信验证码")
					   	//这里写发送验证码的代码
					    $.ajax({
					        type: "post",
					        url: "/sms/send.do",
					        data: {
					    		phone:phone
					    	},
					        dataType: "json",
					        success: function (data) {
					    		console.log(data);
					    	var sendStatusSet=data.SendStatusSet; 
					    	console.log(sendStatusSet);
					    	 for(var i=0;i<sendStatusSet.length;i++)
					    	 {  
					    	  var Code= sendStatusSet[0].Code;  
					    	 }   
					        if (Code==='Ok') {
					            $("#sendSMS").html("发送成功");
								btn_sms.disabled = true;
					    		
					        } else {
					    		$("#sendSMS").html("发送失败"); 
								btn_sms.disabled = false;  
					            }
					        }
					    });
					
					
				}
			}
		
	}
	,
    // 提交表单
    submit : function(){
        var formData = {
                username        : $.trim($('#username').val()),
                password        : $.trim($('#password').val()),
                passwordConfirm : $.trim($('#password-confirm').val()),
                phone           : $.trim($('#phone').val()),
				sms             :$.trim($('#sms').val()),
                email           : $.trim($('#email').val()),
                question        : $.trim($('#question').val()),
                answer          : $.trim($('#answer').val())
            },
            // 表单验证结果
            validateResult = this.formValidate(formData);
        // 验证成功
        if(validateResult.status){
            _user.register(formData, function(res){
                window.location.href = './result.html?type=register';
            }, function(errMsg){	
                formError.show(errMsg);
            });
        }
        // 验证失败
        else{
            // 错误提示
            formError.show(validateResult.msg);
        }

    },
    // 表单字段的验证
    formValidate : function(formData){
        var result = {
            status  : false,
            msg     : ''
        };
        // 验证用户名是否为空
        if(!_mm.validate(formData.username, 'require')){
            result.msg = '用户名不能为空';
            return result;
        }
        // 验证密码是否为空
        if(!_mm.validate(formData.password, 'require')){
            result.msg = '密码不能为空';
            return result;
        }
        // 验证密码长度
        if(formData.password.length < 6){
            result.msg = '密码长度不能少于6位';
            return result;
        }
        // 验证两次输入的密码是否一致
        if(formData.password !== formData.passwordConfirm){
            result.msg = '两次输入的密码不一致';
            return result;
        }
        // 验证手机号
        if(!_mm.validate(formData.phone, 'phone')){
            result.msg = '手机号格式不正确';
            return result;
        }
        // 验证邮箱格式
        if(!_mm.validate(formData.email, 'email')){
            result.msg = '邮箱格式不正确';
            return result;
        }
        // 验证密码提示问题是否为空
        if(!_mm.validate(formData.question, 'require')){
            result.msg = '密码提示问题不能为空';
            return result;
        }
        // 验证密码提示问题答案是否为空
        if(!_mm.validate(formData.answer, 'require')){
            result.msg = '密码提示问题答案不能为空';
            return result;
        }
        // 通过验证，返回正确提示
        result.status   = true;
        result.msg      = '验证通过';
        return result;
    }
};
$(function(){
    page.init();
});