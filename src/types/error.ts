export class HttpResError extends Error {
  status: number = 404;
  msgCode: string | number = '100';
  params?: { [key: string]: string };

  constructor(
    message?: string | { msgCode?: string | number; message?: string },
    status?: number,
    params?: { [key: string]: string }
  ) {
    let mes = typeof message == 'string' ? message : (message?.message ?? '');
    super(mes);
    this.status = status ?? this.status;
    if (typeof message == 'object') {
      this.msgCode = message.msgCode ?? this.msgCode;
    }
    this.params = params;
  }
}
