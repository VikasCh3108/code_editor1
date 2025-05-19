from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import docker
import tempfile
import os

class ExecuteCodeView(APIView):
    def post(self, request):
        code = request.data.get('code', '')
        language = request.data.get('language', 'python')
        if language != 'python':
            return Response({'error': 'Only Python is supported.'}, status=status.HTTP_400_BAD_REQUEST)

        # This backend supports any kind of Python code, including mathematical calculations, scripts with or without input(), and robust error handling.
        client = docker.from_env()
        output = ''
        temp_dir = tempfile.mkdtemp()
        try:
            code_path = os.path.join(temp_dir, 'code.py')
            with open(code_path, 'w') as f:
                f.write(code)
                f.flush()
            stdin_data = request.data.get('stdin', '')
            if stdin_data:
                input_path = os.path.join(temp_dir, 'input.txt')
                with open(input_path, 'w') as fin:
                    fin.write(stdin_data)
                    fin.flush()
                shell_command = f'sh -c "cat /mnt/input.txt | python /mnt/code.py 2>&1"'
            else:
                shell_command = f'python /mnt/code.py 2>&1'
            result = client.containers.run(
                image='python:3',
                command=shell_command,
                volumes={temp_dir: {'bind': '/mnt', 'mode': 'ro'}},
                remove=True,
                stderr=True,
                stdout=True,
                network_disabled=True,
                mem_limit='128m',
                pids_limit=64,
                detach=False,
                environment={},
                user=1000,
                working_dir='/mnt',
                stdin_open=True,
                tty=False
            )
            output = result.decode('utf-8')
        except docker.errors.ContainerError as e:
            output = e.stderr.decode('utf-8') if e.stderr else str(e)
        except Exception as e:
            output = str(e)
        finally:
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
        return Response({'output': output})

# Create your views here.
