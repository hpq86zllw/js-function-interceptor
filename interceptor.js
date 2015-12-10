/**
 * @name Function Interceptor
 * @author Camel
 */
(function($){
	
	function Interceptor(){

		var pointer = this;
		// 拦截器状态，默认为开启
		this.status = true;

		// 预处理方法
		this.preHandle = function(){
			return true;
		};
		// 后处理方法
		this.postHandle = function(result){
			return result;
		};
		
		return {
		
			// 设置预处理方法，参数类型是function时才能设置成功
			setPreHandle : function(func){
				
				if("function" != typeof func){
					return;
				}
				
				pointer.preHandle = func;
				
			},
			// 设置后处理方法，参数类型是function时才能设置成功
			setPostHandle : function(func){
				
				if("function" != typeof func){
					return;
				}
				
				pointer.postHandle = func;
				
			},
			// 开启拦截器
			start : function(){
				pointer.status = true;
			},
			// 停止拦截器
			stop : function(){
				pointer.status = false;
			},
		
			// 拦截方法，分别在调用方法前后，调用预处理方法和后处理方法
			intercept : function(func){
				
				if("function" != typeof func){
					return null;
				}
				var originalFunction = func.originalFunction;
				if(!originalFunction){
					originalFunction = func;
				}
				var interceptors = originalFunction.interceptors;
				if(!interceptors){
					interceptors = new Array();
					originalFunction.interceptors = interceptors;
				}
				if(-1 == $.inArray(pointer, interceptors)){
					interceptors.push(pointer);
				}
				
				var interceptedFunction =  function(){
					
					// 当拦截器状态为开启，且预处理方法返回false时，不再继续往下执行
					for(var i = 0;i < interceptors.length;i++){
						if(interceptors[i].status && !invoke(interceptors[i].preHandle, arguments)){
							return;
						}
					}

					// 调用方法，获得result
					var result = invoke(originalFunction, arguments);

					// 当拦截器状态为开启时，调用后处理方法处理result
					for(var i = 0;i < interceptors.length;i++){
						if(interceptors[i].status){
							result = interceptors[i].postHandle(result);
						}
					}
					
					return result;
					
				};
				interceptedFunction.originalFunction = originalFunction;
				
				return interceptedFunction;
				
			},
			// 释放被拦截的方法，方法执行时不再被拦截器拦截
			release : function(func){
				
				var originalFunction = func.originalFunction;
				if(!originalFunction){
					return func;
				}
				
				var interceptors = originalFunction.interceptors;
				for(var i = 0;i < interceptors.length;i++){
					if(pointer == interceptors[i]){
						interceptors.splice(i, 1);
					}
				}
				
				return func;
				
			}

		};
		
	}
	
	// 调用方法，类似java的反射
	function invoke(func, funcArgs){
		
		var funcArgArray = new Array();
		for(var i = 0;i < funcArgs.length;i++){
			funcArgArray.push(funcArgs[i]);
		}
			
		return func.apply(null, funcArgArray);
		
	}
	
	// 拦截器存储器InterceptorMap，以interceptorName为key，interceptor为value
	var InterceptorMap = new Object();
	
	// 从InterceptorMap中获取key为interceptorName的interceptor，若不存在，则创建一个interceptor并放入InterceptorMap中
	$.newInterceptor = function(interceptorName){
		
		var interceptor = InterceptorMap[interceptorName];
		if(!interceptor){
			interceptor = new Interceptor();
			InterceptorMap[interceptorName] = interceptor;
		}
		
		return interceptor;
		
	};
	
})(jQuery);
